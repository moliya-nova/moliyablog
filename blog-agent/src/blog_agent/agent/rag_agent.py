"""RAG 智能体 — 检索调度 + RAG 上下文拼接"""

from langchain_core.messages import SystemMessage

from blog_agent.agent.base_agent import BaseAgent
from blog_agent.agent.prompt.rag_prompt import RAG_CONTEXT_PREFIX, RAG_DOC_SEPARATOR, RAG_DOC_TEMPLATE
from blog_agent.rag.rag_service import search
from blog_agent.core.logger import get_logger

logger = get_logger(__name__)


class RagAgent(BaseAgent):
    # 执行 RAG 检索并拼接上下文
    # Returns: (rag_context, rag_sources) — 格式化的上下文字符串和来源列表
    async def retrieve(self, query: str, k: int = 2) -> tuple[str, list]:
        parent_docs, sources = await search(query, k=k)

        if not parent_docs:
            return "", sources

        context_parts = []
        for doc in parent_docs:
            context_parts.append(
                RAG_DOC_TEMPLATE.format(
                    title=doc["title"],
                    url=doc.get("url", ""),
                    content=doc["content"],
                )
            )
        context = RAG_DOC_SEPARATOR.join(context_parts)

        logger.info(f"RAG 上下文拼接完成，共 {len(parent_docs)} 篇")
        return context, sources

    # 生成带前缀的 RAG 上下文 SystemMessage
    def build_rag_context_message(self, rag_context: str) -> SystemMessage:
        return SystemMessage(content=RAG_CONTEXT_PREFIX.format(rag_context=rag_context))
