"""FastAPI 应用入口"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from blog_agent.core.lifecycle import lifespan
from blog_agent.api.chat_router import router as chat_router
from blog_agent.api.config_router import router as config_router
from blog_agent.api.rag_router import router as rag_router


app = FastAPI(
    title="博客AI助手API",
    version="1.0.0",
    description="用于博客AI助手的接口服务，提供对话、RAG检索功能",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(config_router)
app.include_router(rag_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "blog_agent.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
