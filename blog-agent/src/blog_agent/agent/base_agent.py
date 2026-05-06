"""基础 Agent 抽象类 — 持有 LLM 连接，子类实现各自的提示词拼接逻辑"""

from blog_agent.llm.llm_client import LLMClient


class BaseAgent:
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client

    @property
    def llm(self):
        return self.llm_client.llm

    def reload(self):
        """热重载自身配置，子类重写"""
        pass
