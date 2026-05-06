"""SSE (Server-Sent Events) 格式化工具 — 跨模块通用的流式输出辅助函数"""

import json
from typing import AsyncGenerator

from blog_agent.core.logger import get_logger

logger = get_logger(__name__)


def format_sse_event(data: dict) -> str:
    """把 dict 序列化为 SSE 格式的 data 行"""
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


async def sse_stream(
    generator: AsyncGenerator[str, None],
    error_msg: str = "Stream error",
) -> AsyncGenerator[str, None]:
    """遍历上游 async generator，将每个 chunk 包装为 SSE 事件并 yield，异常时 yield 错误事件"""
    try:
        async for chunk in generator:
            event = {"code": 200, "msg": "success", "data": chunk}
            yield format_sse_event(event)
    except Exception as e:
        logger.error(f"{error_msg}: {e}")
        error = {"code": 500, "msg": str(e), "data": ""}
        yield format_sse_event(error)
