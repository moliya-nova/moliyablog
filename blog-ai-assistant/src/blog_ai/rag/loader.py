class BlogLoader:
    def __init__(self, api_base: str):
        self.api_base = api_base

    async def load_all_articles(self) -> list[dict]:
        # TODO: fetch articles from blog API
        return []

    async def load_article(self, article_id: int) -> dict | None:
        # TODO: fetch single article
        return None
