"""提示词模块 — 按 Agent 分类组织，通过命名常量引用"""
from blog_agent.agent.prompt.system_prompt import SYSTEM_DEFAULT
from blog_agent.agent.prompt.chat_prompt import (
    CLASSIFY_PROMPT,
    FALLBACK_SUMMARY,
    HISTORY_SUMMARY_PREFIX,
    SUMMARY_COMPRESSION,
)
from blog_agent.agent.prompt.rag_prompt import (
    RAG_CONTEXT_PREFIX,
    RAG_DOC_SEPARATOR,
    RAG_DOC_TEMPLATE,
)

__all__ = [
    "SYSTEM_DEFAULT",
    "CLASSIFY_PROMPT",
    "FALLBACK_SUMMARY",
    "HISTORY_SUMMARY_PREFIX",
    "SUMMARY_COMPRESSION",
    "RAG_CONTEXT_PREFIX",
    "RAG_DOC_TEMPLATE",
    "RAG_DOC_SEPARATOR",
]
