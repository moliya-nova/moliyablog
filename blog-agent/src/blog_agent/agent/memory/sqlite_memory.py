"""记忆管理 — 短期记忆 / 摘要记忆 / 长期记忆的持久化与查询"""

import time
from typing import Dict, List

from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from blog_agent.core.logger import get_logger

logger = get_logger(__name__)


class MemoryManager:
    def __init__(self):
        self._saver_ctx = AsyncSqliteSaver.from_conn_string("data/memory.db")
        self.checkpointer = None
        self._thread_access: Dict[str, float] = {}
        self._threads_loaded = False

    # 异步初始化：进入 AsyncSqliteSaver 上下文并建表
    async def init(self):
        self.checkpointer = await self._saver_ctx.__aenter__()
        await self._init_message_log()
        logger.info("MemoryManager 初始化完成")

    # 初始化消息日志表和线程用户映射表
    async def _init_message_log(self):
        await self.checkpointer.conn.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                thread_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at REAL NOT NULL
            )
        """)
        await self.checkpointer.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id)"
        )
        await self.checkpointer.conn.execute("""
            CREATE TABLE IF NOT EXISTS thread_users (
                thread_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                created_at REAL NOT NULL
            )
        """)
        await self.checkpointer.conn.commit()

    # 记录一条消息到日志表
    async def save_message(self, thread_id: str, role: str, content: str):
        await self.checkpointer.conn.execute(
            "INSERT INTO chat_messages (thread_id, role, content, created_at) VALUES (?, ?, ?, ?)",
            (thread_id, role, content, time.time()),
        )
        await self.checkpointer.conn.commit()

    # 记录 thread_id 与用户名的映射（已存在则忽略）
    async def save_thread_user(self, thread_id: str, username: str):
        await self.checkpointer.conn.execute(
            "INSERT OR IGNORE INTO thread_users (thread_id, username, created_at) VALUES (?, ?, ?)",
            (thread_id, username, time.time()),
        )
        await self.checkpointer.conn.commit()

    # 获取指定会话的消息历史
    async def get_message_history(self, thread_id: str) -> List[Dict]:
        cursor = await self.checkpointer.conn.execute(
            "SELECT role, content, created_at FROM chat_messages WHERE thread_id = ? ORDER BY id",
            (thread_id,),
        )
        rows = await cursor.fetchall()
        return [
            {"role": row[0], "content": row[1], "created_at": row[2]}
            for row in rows
        ]

    # 更新线程访问时间
    def touch_thread(self, thread_id: str):
        self._thread_access[thread_id] = time.time()

    # 从 SQLite 加载已有的 thread_id 列表
    async def _load_existing_threads(self):
        try:
            async with self.checkpointer.conn.cursor() as cursor:
                await cursor.execute("SELECT DISTINCT thread_id FROM checkpoints")
                rows = await cursor.fetchall()
            for row in rows:
                thread_id = row[0]
                if thread_id not in self._thread_access:
                    self._thread_access[thread_id] = 0.0
            self._threads_loaded = True
            logger.info(f"从 SQLite 加载了 {len(rows)} 个历史会话线程")
        except Exception as e:
            self._threads_loaded = True
            logger.warning(f"加载历史会话线程失败（首次运行时正常）: {e}")

    # 确保历史线程列表已加载
    async def ensure_threads_loaded(self):
        if not self._threads_loaded:
            await self._load_existing_threads()

    # 清除指定会话的持久记忆
    async def delete_memory(self, thread_id: str):
        try:
            await self.checkpointer.adelete_thread(thread_id)
        except Exception as e:
            logger.warning(f"删除 checkpointer 线程失败（可忽略）: {e}")
        await self.checkpointer.conn.execute(
            "DELETE FROM chat_messages WHERE thread_id = ?", (thread_id,)
        )
        await self.checkpointer.conn.execute(
            "DELETE FROM thread_users WHERE thread_id = ?", (thread_id,)
        )
        await self.checkpointer.conn.commit()
        self._thread_access.pop(thread_id, None)
        logger.info(f"已清除会话记忆: thread_id={thread_id}")

    # 返回活跃会话线程列表（过滤超过15分钟未访问的过期条目）
    async def get_active_threads(self) -> List[Dict]:
        now = time.time()
        ttl = 900  # 15 分钟
        expired = [tid for tid, t in self._thread_access.items() if now - t > ttl]
        for tid in expired:
            del self._thread_access[tid]

        # 批量查询用户名映射
        username_map = {}
        try:
            cursor = await self.checkpointer.conn.execute(
                "SELECT thread_id, username FROM thread_users"
            )
            rows = await cursor.fetchall()
            username_map = {row[0]: row[1] for row in rows}
        except Exception:
            pass

        return [
            {
                "thread_id": tid,
                "username": username_map.get(tid, ""),
                "last_access": int(t),
                "expires_in": max(0, int(ttl - (now - t))),
            }
            for tid, t in self._thread_access.items()
        ]

    # 清除所有会话记忆
    async def clear_all_memory(self):
        thread_ids = list(self._thread_access.keys())
        success_count = 0
        for tid in thread_ids:
            try:
                await self.checkpointer.adelete_thread(tid)
                success_count += 1
            except Exception as e:
                logger.warning(f"删除线程 {tid} 失败（跳过）: {e}")
            self._thread_access.pop(tid, None)
        # 清理消息日志和用户映射
        try:
            if thread_ids:
                placeholders = ",".join("?" for _ in thread_ids)
                await self.checkpointer.conn.execute(
                    f"DELETE FROM chat_messages WHERE thread_id IN ({placeholders})", thread_ids
                )
                await self.checkpointer.conn.execute(
                    f"DELETE FROM thread_users WHERE thread_id IN ({placeholders})", thread_ids
                )
                await self.checkpointer.conn.commit()
        except Exception as e:
            logger.warning(f"清理日志数据失败: {e}")
        logger.info(f"已清除所有会话记忆，成功 {success_count}/{len(thread_ids)} 个线程")
