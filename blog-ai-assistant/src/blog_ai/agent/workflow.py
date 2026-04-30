class AgentWorkflow:
    def __init__(self, llm_client):
        self.llm = llm_client

    async def run(self, user_input: str) -> str:
        # TODO: implement LangGraph workflow
        return ""
