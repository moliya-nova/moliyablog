# 条件路由 — 根据分类结果决定走 RAG 流程还是直接对话
def route_after_classify(state) -> str:
    return "retrieve" if state.get("need_rag") else "llm"


