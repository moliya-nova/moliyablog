from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from blog_ai.llm.instance import llm_client
from blog_ai.utils.logger import get_logger
import json

logger = get_logger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"


# 流式接口（SpringBoot 可接收 JSON 流）
@router.post("/stream")
async def stream_chat(request: ChatRequest):
    async def generate():
        try:
            async for chunk in llm_client.stream_chat(request.message, thread_id=request.thread_id):
                # 关键：SpringBoot 能识别的 JSON 流式格式
                data = {
                    "code": 200,
                    "msg": "success",
                    "data": chunk
                }
                yield f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

        except Exception as e:
            logger.error(f"Stream error: {e}")
            error = {
                "code": 500,
                "msg": str(e),
                "data": ""
            }
            yield f"data: {json.dumps(error, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"  # SSE 必须
    )


# 清除指定会话的临时记忆
@router.delete("/memory/{thread_id}")
async def delete_memory(thread_id: str):
    try:
        llm_client.delete_memory(thread_id)
        return {"code": 200, "msg": "记忆已清除", "data": None}
    except Exception as e:
        logger.error(f"Delete memory error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 获取活跃会话线程列表
@router.get("/threads")
async def get_active_threads():
    """列出当前所有活跃的会话线程"""
    threads = llm_client.get_active_threads()
    return {"code": 200, "msg": "success", "data": threads}


# 清除所有会话记忆
@router.delete("/memory")
async def clear_all_memory():
    """清除所有会话记忆"""
    try:
        llm_client.clear_all_memory()
        return {"code": 200, "msg": "所有记忆已清除", "data": None}
    except Exception as e:
        logger.error(f"Clear all memory error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
