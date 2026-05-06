"""ChromaDB 向量存储 — 管理子块的嵌入、存储和检索"""

import asyncio

import chromadb

from blog_agent.core.settings import settings
from blog_agent.core.logger import get_logger

logger = get_logger(__name__)

COLLECTION_NAME = "blog_articles"


class VectorStore:
    def __init__(self, persist_dir: str | None = None):
        self.persist_dir = persist_dir or settings.vector_store_path
        self.client = chromadb.PersistentClient(path=self.persist_dir)
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            f"VectorStore 初始化完成: dir={self.persist_dir}, "
            f"collection={COLLECTION_NAME}, count={self.collection.count()}"
        )

    def _add_documents_sync(self, documents: list[dict]) -> int:
        if not documents:
            return 0
        ids = [d["chunk_id"] for d in documents]
        contents = [d["page_content"] for d in documents]
        metadatas = [d["metadata"] for d in documents]
        self.collection.upsert(ids=ids, documents=contents, metadatas=metadatas)
        return len(documents)

    async def add_documents(self, documents: list[dict]) -> int:
        return await asyncio.to_thread(self._add_documents_sync, documents)

    def _delete_by_article_id_sync(self, article_id: int):
        self.collection.delete(where={"article_id": article_id})

    async def delete_by_article_id(self, article_id: int):
        await asyncio.to_thread(self._delete_by_article_id_sync, article_id)

    def _similarity_search_sync(self, query: str, k: int) -> list[dict]:
        count = self.collection.count()
        if count == 0:
            return []
        actual_k = min(k, count)
        results = self.collection.query(query_texts=[query], n_results=actual_k)

        docs = []
        for i in range(len(results["ids"][0])):
            docs.append({
                "chunk_id": results["ids"][0][i],
                "page_content": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i] if results.get("distances") else None,
            })
        return docs

    # 按查询相似度检索子块
    # query: 查询文本
    # k: 返回的子块数量，默认5个
    async def similarity_search(self, query: str, k: int = 5) -> list[dict]:
        return await asyncio.to_thread(self._similarity_search_sync, query, k)
