import sqlite3
import time
from typing import Dict, List

from langchain_openai import ChatOpenAI
from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    RemoveMessage,
    SystemMessage,
)

from langgraph.graph import END, StateGraph, MessagesState
from langgraph.checkpoint.sqlite import SqliteSaver

from blog_ai.config import settings
from blog_ai.utils.logger import get_logger

logger = get_logger(__name__)


# ==================== 三层记忆状态 ====================
class BlogAgentState(MessagesState):
    """博客AI智能体状态 — 三层记忆架构

    - messages:  短期记忆（内存），最多保留 16 条（8 轮）
    - summary:   摘要记忆（内存），40-60 字全局总结
    - SQLite 自动持久化全量历史作为长期记忆
    """
    summary: str


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

        # SqliteSaver — 长期记忆持久化到磁盘
        conn = sqlite3.connect("memory.db", check_same_thread=False)
        self.checkpointer = SqliteSaver(conn)
        self.checkpointer.setup()

        # 线程访问追踪（供管理 API 使用）
        self._thread_access: Dict[str, float] = {}

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
        """构建 LangGraph Agent，含记忆压缩节点"""
        builder = StateGraph(BlogAgentState)

        system_prompt = self.system_prompt

        # ==================== LLM 调用节点 ====================
        async def llm_node(state: BlogAgentState):
            messages = list(state["messages"])
            summary = state.get("summary", "")

            # 上下文组装: 固定系统提示词 → 历史摘要 → 最新 16 条消息
            context_messages = [SystemMessage(content=system_prompt)]
            if summary:
                context_messages.append(
                    SystemMessage(content=f"[历史对话摘要] {summary}")
                )
            if len(messages) > 16:
                messages = messages[-16:]
            context_messages.extend(messages)

            response = await self.llm.ainvoke(context_messages)
            return {"messages": [response]}

        # ==================== 记忆压缩节点 ====================
        async def summarize_node(state: BlogAgentState):
            messages = state["messages"]
            if len(messages) <= 16:
                return {}

            old_messages = messages[:-16]
            old_summary = state.get("summary", "")

            text_parts = []
            for msg in old_messages:
                role = "用户" if isinstance(msg, HumanMessage) else "助手"
                content = msg.content if isinstance(msg.content, str) else str(msg.content)
                text_parts.append(f"{role}: {content}")

            summary_prompt = (
                "请将以下对话历史总结为40-60字的简短摘要（保留关键信息和上下文）：\n\n"
                f"已有摘要：{old_summary if old_summary else '无'}\n\n"
                f"对话记录：\n{chr(10).join(text_parts)}\n\n"
                "请直接输出40-60字摘要（不要加引号或其他说明）："
            )

            try:
                response = await self.llm.ainvoke([HumanMessage(content=summary_prompt)])
                new_summary = response.content.strip()
                if len(new_summary) > 60:
                    new_summary = new_summary[:60]
            except Exception:
                new_summary = f"对话涉及{len(old_messages)}条消息"

            remove_ops = [RemoveMessage(id=m.id) for m in old_messages]
            return {"messages": remove_ops, "summary": new_summary}

        # ==================== 图结构 ====================
        builder.add_node("llm", llm_node)
        builder.add_node("summarize", summarize_node)
        builder.set_entry_point("llm")
        builder.add_edge("llm", "summarize")
        builder.add_edge("summarize", END)

        self.agent = builder.compile(checkpointer=self.checkpointer)

    def reload(self):
        """重新加载 LLM 配置并重建 Agent（保留 SqliteSaver 即保留对话记忆）"""
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

        if settings.system_prompt is not None:
            self.system_prompt = settings.system_prompt

        self._build_agent()
        logger.info(f"LLM client reloaded: model={self.model}, base_url={self.base_url}")

    def delete_memory(self, thread_id: str):
        """清除指定会话的持久记忆"""
        self.checkpointer.delete_thread(thread_id)
        self._thread_access.pop(thread_id, None)
        logger.info(f"已清除会话记忆: thread_id={thread_id}")

    def get_active_threads(self) -> List[Dict]:
        """返回活跃会话线程列表"""
        return [
            {
                "thread_id": tid,
                "last_access": int(t),
            }
            for tid, t in self._thread_access.items()
        ]

    def clear_all_memory(self):
        """清除所有会话记忆"""
        thread_ids = list(self._thread_access.keys())
        for tid in thread_ids:
            self.checkpointer.delete_thread(tid)
            self._thread_access.pop(tid, None)
        logger.info(f"已清除所有会话记忆，共 {len(thread_ids)} 个线程")

    async def stream_chat(self, message: str, thread_id: str = "default"):
        logger.info(f"Sending message to LLM model={self.model}")

        if not self.api_key:
            logger.warning("LLM_API_KEY 未配置")
            for chunk in ["Echo: ", message]:
                yield chunk
            return

        self._thread_access[thread_id] = time.time()

        async for chunk in self.agent.astream(
            {"messages": [HumanMessage(content=message)]},
            config={"configurable": {"thread_id": thread_id}},
            stream_mode="values",
        ):
            last_message = chunk["messages"][-1]
            if isinstance(last_message, AIMessage) and last_message.content:
                yield last_message.content

        self._thread_access[thread_id] = time.time()
