"""LLM Client — 仅负责 LLM 模型连接，不持有提示词"""

from langchain_openai import ChatOpenAI

from blog_agent.core.settings import settings
from blog_agent.core.logger import get_logger

logger = get_logger(__name__)


class LLMClient:
    def __init__(self):
        self.api_key = settings.llm_api_key
        base_url = settings.llm_base_url.rstrip("/")
        if base_url and not base_url.startswith(("http://", "https://")):
            base_url = "https://" + base_url
        self.base_url = base_url
        self.model = settings.llm_model

        self.llm = ChatOpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
            model=self.model,
            timeout=60,
            streaming=True,
        )

    # 异步初始化（预留扩展点）
    async def init(self):
        logger.info("LLM Client 初始化完成")

    # 重新加载 LLM 配置
    def reload(self):
        self.api_key = settings.llm_api_key
        base_url = settings.llm_base_url.rstrip("/")
        if base_url and not base_url.startswith(("http://", "https://")):
            base_url = "https://" + base_url
        self.base_url = base_url
        self.model = settings.llm_model

        self.llm = ChatOpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
            model=self.model,
            timeout=60,
            streaming=True,
        )

        logger.info(f"LLM client reloaded: model={self.model}, base_url={self.base_url}")
