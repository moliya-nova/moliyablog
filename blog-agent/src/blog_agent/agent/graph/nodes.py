"""LangGraph 节点工厂 — 分类 / RAG 检索 / LLM 调用 / 记忆压缩，委托给对应 Agent"""

from langchain_core.messages import HumanMessage, RemoveMessage

from blog_agent.core.logger import get_logger

logger = get_logger(__name__)


# 返回 classify_node：委托 ChatAgent 判断是否需要 RAG 检索
def make_classify_node(chat_agent):

    async def classify_node(state):
        messages = state["messages"]
        query = ""
        for msg in reversed(messages):
            if isinstance(msg, HumanMessage):
                query = msg.content if isinstance(msg.content, str) else str(msg.content)
                break

        need_rag = await chat_agent.classify(query) if query else False
        logger.info(f"路由分类: need_rag={need_rag}, query={query[:50] if query else 'N/A'}")
        return {"need_rag": need_rag}

    return classify_node


# 返回 retrieve_node：委托 RagAgent 执行 RAG 检索
def make_retrieve_node(rag_agent):
    """返回 retrieve_node：委托 RagAgent 执行 RAG 检索"""

    async def retrieve_node(state):
        messages = state["messages"]
        if not messages:
            return {"rag_context": "", "rag_sources": []}

        # 取最后一条用户消息作为查询
        query = ""
        for msg in reversed(messages):
            if isinstance(msg, HumanMessage):
                query = msg.content if isinstance(msg.content, str) else str(msg.content)
                break
        if not query:
            return {"rag_context": "", "rag_sources": []}

        rag_context, rag_sources = await rag_agent.retrieve(query)
        return {"rag_context": rag_context, "rag_sources": rag_sources}

    return retrieve_node


def make_llm_node(chat_agent):
    """返回 llm_node：委托 ChatAgent 组装上下文并调用 LLM"""

    async def llm_node(state):
        context_messages = chat_agent.build_context_messages(state)

        collected = None
        async for chunk in chat_agent.llm.astream(context_messages):
            if collected is None:
                collected = chunk
            else:
                collected = collected + chunk
        return {"messages": [collected]}

    return llm_node


def make_summarize_node(chat_agent):
    """返回 summarize_node：超过 16 条消息时委托 ChatAgent 压缩记忆"""

    async def summarize_node(state):
        messages = state["messages"]
        if len(messages) <= 16:
            return {}

        old_messages = messages[:-16]
        old_summary = state.get("summary", "")

        new_summary = await chat_agent.generate_summary(old_messages, old_summary)

        remove_ops = [RemoveMessage(id=m.id) for m in old_messages]
        return {"messages": remove_ops, "summary": new_summary}

    return summarize_node
