"""FastAPI 应用生命周期 — 启动初始化 / 关闭清理"""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from blog_agent.agent.chat_agent import ChatAgent
from blog_agent.agent.rag_agent import RagAgent
from blog_agent.agent.memory.sqlite_memory import MemoryManager
from blog_agent.agent.graph.workflow import AgentWorkflow
from blog_agent.api import chat_router as chat_module
from blog_agent.api import config_router as config_module
from blog_agent.llm import llm_client
from blog_agent.rag.store_factory import close_doc_store, init_doc_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 初始化 LLM Client
    await llm_client.init()

    # 创建 Agent 实例
    chat_agent = ChatAgent(llm_client)
    rag_agent = RagAgent(llm_client)

    # 初始化记忆管理器
    memory_manager = MemoryManager()
    await memory_manager.init()

    # 初始化 Agent 编排
    workflow = AgentWorkflow(chat_agent, rag_agent, memory_manager)
    workflow.build()

    # 注入到 API 模块
    chat_module.set_workflow(workflow)
    config_module.set_workflow(workflow)

    # 初始化 RAG 文档存储
    await init_doc_store()

    # 应用运行阶段
    yield

    # 关闭 RAG 文档存储
    await close_doc_store()
