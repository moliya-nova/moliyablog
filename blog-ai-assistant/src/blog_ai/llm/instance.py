from blog_ai.llm.client import LLMClient

# 全局单例，chat.py 和 config.py 共用此实例
llm_client = LLMClient()
