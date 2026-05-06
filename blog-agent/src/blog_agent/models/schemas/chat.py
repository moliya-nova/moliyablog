"""聊天 API 请求模型"""

from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"
    username: str = ""
