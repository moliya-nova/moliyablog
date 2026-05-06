from blog_agent.llm.llm_client import LLMClient

# 全局单例，供 main.py / config_router.py 使用
llm_client = LLMClient()
