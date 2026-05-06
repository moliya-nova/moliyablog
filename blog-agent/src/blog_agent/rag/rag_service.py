"""RAG 检索服务 — 纯向量搜索 + 父块回溯，不含提示词拼接"""

from blog_agent.rag.store_factory import get_doc_store, get_vector_store
from blog_agent.core.logger import get_logger

logger = get_logger(__name__)


# 执行 RAG 检索：向量搜索 → 父块回溯
# Returns: (parent_docs, sources) — 父文档列表和来源元数据
async def search(query: str, k: int = 2) -> tuple[list, list]:
    vector_store = get_vector_store()
    doc_store = get_doc_store()

    try:
        child_chunks = await vector_store.similarity_search(query, k=k)
    except Exception as e:
        logger.warning(f"RAG 向量检索失败: {e}")
        return [], []

    if not child_chunks:
        return [], []

    # 通过 parent_id 回溯完整文章，去重
    seen_parents: set = set()
    parent_docs: list = []
    sources: list = []

    for chunk in child_chunks:
        pid = chunk["metadata"]["parent_id"]
        sources.append({
            "title": chunk["metadata"].get("article_title", ""),
            "url": chunk["metadata"].get("article_url", ""),
            "distance": chunk.get("distance"),
        })
        if pid not in seen_parents:
            seen_parents.add(pid)
            try:
                parent = await doc_store.get_by_parent_id(pid)
                if parent:
                    parent_docs.append(parent)
            except Exception as e:
                logger.warning(f"RAG 父块查询失败: {e}")

    logger.info(f"RAG 检索到 {len(parent_docs)} 篇相关文章")
    return parent_docs, sources
