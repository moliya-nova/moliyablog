"""配置管理 API — 获取/更新 AI 配置 + 热重载"""

from fastapi import APIRouter, HTTPException

from blog_agent.core.settings import settings
from blog_agent.llm import llm_client
from blog_agent.core.logger import get_logger
from blog_agent.models.schemas.config import ConfigUpdateRequest

logger = get_logger(__name__)
router = APIRouter(prefix="/config", tags=["config"])

# workflow 在 main.py lifespan 中设置
_workflow = None


def set_workflow(workflow):
    global _workflow
    _workflow = workflow


# 获取当前 AI 配置（API key 脱敏）
@router.get("")
async def get_config():
    return {"code": 200, "msg": "success", "data": settings.to_dict()}


# 更新 AI 配置并热重载 LLM Client + Agent
@router.put("")
async def update_config(request: ConfigUpdateRequest):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="没有需要更新的字段")

    settings.update(updates)

    try:
        llm_client.reload()
        if _workflow:
            _workflow.rebuild()
        logger.info(f"AI 配置已更新: {updates}")
    except Exception as e:
        logger.error(f"LLM Client 重载失败: {e}")
        raise HTTPException(status_code=500, detail=f"配置已保存但重载失败: {str(e)}")

    return {"code": 200, "msg": "配置已更新", "data": settings.to_dict()}
