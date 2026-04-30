from langchain_openai import ChatOpenAI
from blog_ai.config import settings
from blog_ai.utils.logger import get_logger

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, MessagesState
from langchain_core.messages import HumanMessage, AIMessage

import time
import random
from typing import Dict, List
from langchain_core.messages import SystemMessage

logger = get_logger(__name__)

# ==================== 带自动过期的内存记忆 ====================
class ExpiredMemorySaver(InMemorySaver):
    def __init__(self, expire_seconds: int = 900):  # 900秒 = 15分钟
        super().__init__()
        self.expire_seconds = expire_seconds
        self.last_access: Dict[str, float] = {}  # 记录最后访问时间

    # 读取 checkpoint（聊天记忆）
    def get(self, config):
        thread_id = config["configurable"]["thread_id"]

        # 惰性清理：只检查当前线程是否过期
        if thread_id in self.last_access and self._is_expired(thread_id):
            self.delete(thread_id)
            return None

        self.last_access[thread_id] = time.time()
        checkpoint = super().get(config)

        # 10% 概率触发全局清理（避免每次遍历，同时保证过期数据不会堆积）
        if random.random() < 0.1:
            self._clean_all_expired()

        return checkpoint

    # 保存 checkpoint
    def put(self, config, checkpoint, metadata, new_versions):
        thread_id = config["configurable"]["thread_id"]
        self.last_access[thread_id] = time.time()
        super().put(config, checkpoint, metadata, new_versions)

    # 判断是否超时
    def _is_expired(self, thread_id: str) -> bool:
        if thread_id not in self.last_access:
            return True
        return time.time() - self.last_access[thread_id] > self.expire_seconds

    # 清理所有超时记忆
    def _clean_all_expired(self):
        now = time.time()
        expired = [tid for tid, t in self.last_access.items() if now - t > self.expire_seconds]
        for tid in expired:
            self.delete(tid)  # delete() 内部已清理 last_access

    # 删除指定 thread 的记忆
    def delete(self, thread_id: str):
        super().delete_thread(thread_id)  # 清除 storage + writes + blobs
        self.last_access.pop(thread_id, None)


class LLMClient:
    def __init__(self):
        self.api_key = settings.llm_api_key
        base_url = settings.llm_base_url.rstrip("/")
        if base_url and not base_url.startswith(("http://", "https://")):
            base_url = "https://" + base_url
        self.base_url = base_url
        self.model = settings.llm_model

        self.llm = ChatOpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
            model=self.model,
            timeout=60,
            streaming=True,
        )

        # ==================== 核心：15 分钟自动过期记忆 ====================
        self.checkpointer = ExpiredMemorySaver(expire_seconds=900)  # 15分钟

        # 系统提示词
        self.system_prompt = settings.system_prompt or """
            记住,你是一个专业、友好、耐心的AI博客系统助手。
            你的名字叫马小凯。
            你永远用简洁、清晰、礼貌的中文回答。
            你不会编造信息，不会回答危险内容。
            你只会根据用户的问题提供帮助。
            """

        self._build_agent()

    def _build_agent(self):
        """构建 LangGraph Agent（供 __init__ 和 reload 共用）"""
        builder = StateGraph(MessagesState)

        system_prompt = self.system_prompt

        async def llm_node(state: MessagesState):
            messages = state["messages"]
            # 自动插入系统提示词
            messages = [SystemMessage(content=system_prompt)] + messages
            if len(messages) > 20:  # 保留最近10轮
                messages = messages[-20:]
            response = await self.llm.ainvoke(messages)
            return {"messages": [response]}

        builder.add_node("llm", llm_node)
        builder.set_entry_point("llm")
        self.agent = builder.compile(checkpointer=self.checkpointer)

    def reload(self):
        """重新加载 LLM 配置并重建 Agent（保留对话记忆）"""
        self.api_key = settings.llm_api_key
        base_url = settings.llm_base_url.rstrip("/")
        if base_url and not base_url.startswith(("http://", "https://")):
            base_url = "https://" + base_url
        self.base_url = base_url
        self.model = settings.llm_model

        self.llm = ChatOpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
            model=self.model,
            timeout=60,
            streaming=True,
        )

        # 更新系统提示词（允许清空）
        if settings.system_prompt is not None:
            self.system_prompt = settings.system_prompt

        # 重建 Agent（保留 checkpointer 即保留对话记忆）
        self._build_agent()
        logger.info(f"LLM client reloaded: model={self.model}, base_url={self.base_url}")

    def delete_memory(self, thread_id: str):
        """清除指定会话的临时记忆"""
        self.checkpointer.delete(thread_id)
        logger.info(f"已清除会话记忆: thread_id={thread_id}")

    def get_active_threads(self) -> List[Dict]:
        """返回活跃会话线程列表"""
        now = time.time()
        return [
            {
                "thread_id": tid,
                "last_access": t,
                "expires_in": max(0, self.checkpointer.expire_seconds - (now - t)),
            }
            for tid, t in self.checkpointer.last_access.items()
        ]

    def clear_all_memory(self):
        """清除所有会话记忆"""
        thread_ids = list(self.checkpointer.last_access.keys())
        for tid in thread_ids:
            self.checkpointer.delete(tid)
        logger.info(f"已清除所有会话记忆，共 {len(thread_ids)} 个线程")

    async def stream_chat(self, message: str, thread_id: str = "default"):
        logger.info(f"Sending message to LLM model={self.model}")

        if not self.api_key:
            logger.warning("LLM_API_KEY 未配置")
            for chunk in ["Echo: ", message]:
                yield chunk
            return

        async for chunk in self.agent.astream(
            {"messages": [HumanMessage(content=message)]},
            config={"configurable": {"thread_id": thread_id}},
            stream_mode="values",
        ):
            last_message = chunk["messages"][-1]
            if isinstance(last_message, AIMessage) and last_message.content:
                yield last_message.content
