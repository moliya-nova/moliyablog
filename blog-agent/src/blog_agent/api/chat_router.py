"""聊天 API — 流式对话、会话管理"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from blog_agent.core.logger import get_logger
from blog_agent.models.schemas.chat import ChatRequest
from blog_agent.utils.sse import sse_stream

logger = get_logger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])

# workflow 在 main.py lifespan 中设置
_workflow = None


def set_workflow(workflow):
    global _workflow
    _workflow = workflow


def _get_workflow():
    if _workflow is None:
        raise HTTPException(status_code=503, detail="AgentWorkflow 尚未初始化")
    return _workflow


# 流式聊天（SSE）
@router.post("/stream")
async def stream_chat(request: ChatRequest):
    workflow = _get_workflow()

    chunks = workflow.stream_chat(
        request.message, thread_id=request.thread_id, username=request.username
    )
    return StreamingResponse(
        sse_stream(chunks), media_type="text/event-stream"
    )


# 清除指定会话的临时记忆
@router.delete("/memory/{thread_id}")
async def delete_memory(thread_id: str):
    try:
        await _get_workflow().memory.delete_memory(thread_id)
        return {"code": 200, "msg": "记忆已清除", "data": None}
    except Exception as e:
        logger.error(f"Delete memory error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 列出当前所有活跃的会话线程
@router.get("/threads")
async def get_active_threads():
    threads = await _get_workflow().memory.get_active_threads()
    return {"code": 200, "msg": "success", "data": threads}


# 获取指定会话的消息历史
@router.get("/history/{thread_id}")
async def get_message_history(thread_id: str):
    try:
        messages = await _get_workflow().memory.get_message_history(thread_id)
        return {"code": 200, "msg": "success", "data": messages}
    except Exception as e:
        logger.error(f"获取消息历史失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 管理员删除单条会话
@router.delete("/thread/{thread_id}")
async def delete_single_thread(thread_id: str):
    try:
        await _get_workflow().memory.delete_memory(thread_id)
        return {"code": 200, "msg": "会话已删除", "data": None}
    except Exception as e:
        logger.error(f"删除会话失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 清除所有会话记忆
@router.delete("/memory")
async def clear_all_memory():
    try:
        await _get_workflow().memory.clear_all_memory()
        return {"code": 200, "msg": "所有记忆已清除", "data": None}
    except Exception as e:
        logger.error(f"Clear all memory error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
