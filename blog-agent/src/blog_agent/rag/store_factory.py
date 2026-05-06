"""存储单例工厂 — DocStore / VectorStore 延迟初始化"""

from blog_agent.core.settings import settings
from blog_agent.rag.vector_store import VectorStore
from blog_agent.rag.docstore import DocStore
from blog_agent.core.logger import get_logger

logger = get_logger(__name__)

_doc_store: DocStore | None = None
_vector_store: VectorStore | None = None


def get_doc_store() -> DocStore:
    global _doc_store
    if _doc_store is None:
        _doc_store = DocStore(settings.docstore_path)
    return _doc_store


def get_vector_store() -> VectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store


# 在 FastAPI lifespan 中调用，初始化 DocStore 表结构
async def init_doc_store():
    ds = get_doc_store()
    await ds.init()


async def close_doc_store():
    global _doc_store, _vector_store
    if _doc_store:
        await _doc_store.close()
    _doc_store = None
    _vector_store = None
