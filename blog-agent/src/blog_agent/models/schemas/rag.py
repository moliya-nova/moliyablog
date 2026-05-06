"""RAG API 请求模型"""

from pydantic import BaseModel


class ArticleIndexRequest(BaseModel):
    article_id: int
    title: str
    url: str
    content: str


class BatchIndexRequest(BaseModel):
    articles: list[ArticleIndexRequest]
