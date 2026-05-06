"""LangGraph 图状态定义 — 三层记忆架构 + RAG 检索"""

from langgraph.graph import MessagesState


class BlogAgentState(MessagesState):
    # 博客 AI 智能体状态
    # - messages:    短期记忆，最多保留 16 条
    # - summary:     摘要记忆，80-100 字全局总结
    # - rag_context: RAG 检索到的博客文章上下文
    # - rag_sources: RAG 检索来源 [{title, url, distance}]
    # - need_rag:    是否需要 RAG 检索
    # - SQLite 自动持久化全量历史作为长期记忆

    summary: str
    rag_context: str
    rag_sources: list
    need_rag: bool
