from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from blog_ai.config import settings
from blog_ai.llm.instance import llm_client
from blog_ai.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/config", tags=["config"])


class ConfigUpdateRequest(BaseModel):
    """AI 配置更新请求（所有字段可选，只更新提供的字段）"""
    llm_api_key: Optional[str] = None
    llm_base_url: Optional[str] = None
    llm_model: Optional[str] = None
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None
    system_prompt: Optional[str] = None


@router.get("")
async def get_config():
    """获取当前 AI 配置（API key 脱敏）"""
    return {"code": 200, "msg": "success", "data": settings.to_dict()}


@router.put("")
async def update_config(request: ConfigUpdateRequest):
    """更新 AI 配置并热重载 LLM Client"""
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="没有需要更新的字段")

    # 更新配置并持久化到 .env
    settings.update(updates)

    # 热重载 LLM Client
    try:
        llm_client.reload()
        logger.info(f"AI 配置已更新: {updates}")
    except Exception as e:
        logger.error(f"LLM Client 重载失败: {e}")
        raise HTTPException(status_code=500, detail=f"配置已保存但重载失败: {str(e)}")

    return {"code": 200, "msg": "配置已更新", "data": settings.to_dict()}
