"""配置 API 请求模型"""

from typing import Optional

from pydantic import BaseModel


class ConfigUpdateRequest(BaseModel):
    # AI 配置更新请求（所有字段可选，只更新提供的字段）
    llm_api_key: Optional[str] = None
    llm_base_url: Optional[str] = None
    llm_model: Optional[str] = None
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None
    system_prompt: Optional[str] = None
