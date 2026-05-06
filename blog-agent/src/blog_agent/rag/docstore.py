"""SQLite 父块文档存储

存储完整文章（父块），通过 parent_id 与 ChromaDB 中的子块关联。
"""

import aiosqlite
from blog_agent.core.logger import get_logger

logger = get_logger(__name__)


# 创建父块文档表
# parent_id: 父类文章ID
# article_id: 子类文章ID
# title: 文章标题
# url: 文章URL
# content: 文章内容
# content_hash: 文章内容MD5哈希值
# created_at: 创建时间
# updated_at: 更新时间
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS parent_documents (
    parent_id    TEXT PRIMARY KEY,
    article_id   INTEGER NOT NULL UNIQUE,
    title        TEXT NOT NULL,
    url          TEXT NOT NULL,
    content      TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
)
"""


# 创建索引
# idx_parent_content_hash: 父类文章ID + 内容哈希值 索引，用于快速查询
CREATE_INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS idx_parent_content_hash ON parent_documents(content_hash)",
]


class DocStore:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.conn: aiosqlite.Connection | None = None

    async def init(self):
        self.conn = await aiosqlite.connect(self.db_path)
        await self.conn.execute(CREATE_TABLE_SQL)
        for idx_sql in CREATE_INDEXES_SQL:
            await self.conn.execute(idx_sql)
        await self.conn.commit()
        logger.info(f"DocStore 初始化完成: {self.db_path}")

    async def close(self):
        if self.conn:
            await self.conn.close()
            self.conn = None

    async def upsert(
        self,
        parent_id: str,
        article_id: int,
        title: str,
        url: str,
        content: str,
        content_hash: str,
        now_iso: str,
    ):
        await self.conn.execute(
            """
            INSERT INTO parent_documents (parent_id, article_id, title, url, content, content_hash, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(parent_id) DO UPDATE SET
                title=excluded.title,
                url=excluded.url,
                content=excluded.content,
                content_hash=excluded.content_hash,
                updated_at=excluded.updated_at
            """,
            (parent_id, article_id, title, url, content, content_hash, now_iso, now_iso),
        )
        await self.conn.commit()

    async def get_by_article_id(self, article_id: int) -> dict | None:
        cursor = await self.conn.execute(
            "SELECT parent_id, article_id, title, url, content, content_hash, created_at, updated_at "
            "FROM parent_documents WHERE article_id = ?",
            (article_id,),
        )
        row = await cursor.fetchone()
        if not row:
            return None
        return {
            "parent_id": row[0],
            "article_id": row[1],
            "title": row[2],
            "url": row[3],
            "content": row[4],
            "content_hash": row[5],
            "created_at": row[6],
            "updated_at": row[7],
        }

    async def get_by_parent_id(self, parent_id: str) -> dict | None:
        cursor = await self.conn.execute(
            "SELECT parent_id, article_id, title, url, content, content_hash, created_at, updated_at "
            "FROM parent_documents WHERE parent_id = ?",
            (parent_id,),
        )
        row = await cursor.fetchone()
        if not row:
            return None
        return {
            "parent_id": row[0],
            "article_id": row[1],
            "title": row[2],
            "url": row[3],
            "content": row[4],
            "content_hash": row[5],
            "created_at": row[6],
            "updated_at": row[7],
        }

    async def delete_by_article_id(self, article_id: int):
        await self.conn.execute(
            "DELETE FROM parent_documents WHERE article_id = ?",
            (article_id,),
        )
        await self.conn.commit()

    async def list_all(self) -> list[dict]:
        cursor = await self.conn.execute(
            "SELECT parent_id, article_id, title, url, content, content_hash, created_at, updated_at "
            "FROM parent_documents ORDER BY article_id"
        )
        rows = await cursor.fetchall()
        return [
            {
                "parent_id": r[0],
                "article_id": r[1],
                "title": r[2],
                "url": r[3],
                "content": r[4],
                "content_hash": r[5],
                "created_at": r[6],
                "updated_at": r[7],
            }
            for r in rows
        ]
