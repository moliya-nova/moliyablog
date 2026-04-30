class VectorStore:
    def __init__(self, persist_dir: str):
        self.persist_dir = persist_dir

    async def add_documents(self, documents: list[dict]) -> int:
        # TODO: embed and store documents
        return 0

    async def similarity_search(self, query: str, k: int = 5) -> list[dict]:
        # TODO: search similar documents
        return []
