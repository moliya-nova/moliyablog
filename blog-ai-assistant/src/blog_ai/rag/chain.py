class RAGChain:
    def __init__(self, llm_client, vector_store):
        self.llm = llm_client
        self.store = vector_store

    async def query(self, question: str) -> str:
        # TODO: retrieve context + generate answer
        return ""
