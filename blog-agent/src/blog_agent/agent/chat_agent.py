"""对话智能体 — 多轮对话 + 提示词拼接 + 记忆压缩"""

from langchain_core.messages import HumanMessage, SystemMessage

from blog_agent.agent.base_agent import BaseAgent
from blog_agent.agent.prompt.chat_prompt import (
    CLASSIFY_PROMPT,
    FALLBACK_SUMMARY,
    HISTORY_SUMMARY_PREFIX,
    SUMMARY_COMPRESSION,
)
from blog_agent.agent.prompt.rag_prompt import RAG_CONTEXT_PREFIX
from blog_agent.agent.prompt.system_prompt import SYSTEM_DEFAULT
from blog_agent.core.settings import settings
from blog_agent.core.logger import get_logger

logger = get_logger(__name__)


class ChatAgent(BaseAgent):
    def __init__(self, llm_client):
        super().__init__(llm_client)
        self.system_prompt = settings.system_prompt or SYSTEM_DEFAULT

    def reload(self):
        if settings.system_prompt is not None:
            self.system_prompt = settings.system_prompt

    # 调用 LLM 判断用户问题是否需要 RAG 检索
    async def classify(self, query: str) -> bool:
        prompt = CLASSIFY_PROMPT.format(user_query=query)
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        return "rag_blog" in response.content.strip()

    # 组装完整上下文：系统提示词 → 历史摘要 → RAG 上下文 → 最新消息
    def build_context_messages(self, state: dict, max_messages: int = 16) -> list:
        messages = list(state.get("messages", []))
        summary = state.get("summary", "")
        rag_context = state.get("rag_context", "")

        context_messages = [SystemMessage(content=self.system_prompt)]

        if summary:
            context_messages.append(
                SystemMessage(content=HISTORY_SUMMARY_PREFIX.format(summary=summary))
            )

        if rag_context:
            context_messages.append(
                SystemMessage(content=RAG_CONTEXT_PREFIX.format(rag_context=rag_context))
            )

        if len(messages) > max_messages:
            messages = messages[-max_messages:]

        context_messages.extend(messages)
        return context_messages

    # 调用 LLM 生成对话摘要，含异常回退
    async def generate_summary(self, old_messages: list, old_summary: str) -> str:
        text_parts = []
        for msg in old_messages:
            role = "用户" if isinstance(msg, HumanMessage) else "助手"
            content = msg.content if isinstance(msg.content, str) else str(msg.content)
            text_parts.append(f"{role}: {content}")

        prompt = SUMMARY_COMPRESSION.format(
            old_summary=old_summary if old_summary else "无",
            text_parts="\n".join(text_parts),
        )

        try:
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            new_summary = response.content.strip()
            if len(new_summary) > 100:
                new_summary = new_summary[:100]
            return new_summary
        except Exception:
            return FALLBACK_SUMMARY.format(count=len(old_messages))
