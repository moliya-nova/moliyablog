import os
import threading
from dotenv import load_dotenv, set_key, find_dotenv

load_dotenv()

ENV_FILE = find_dotenv() or ".env"

# 字段名到环境变量名的映射
_ENV_MAPPING = {
    "llm_api_key": "LLM_API_KEY",
    "llm_base_url": "LLM_BASE_URL",
    "llm_model": "LLM_MODEL",
    "vector_store_path": "VECTOR_STORE_PATH",
    "chunk_size": "CHUNK_SIZE",
    "chunk_overlap": "CHUNK_OVERLAP",
    "blog_api_base": "BLOG_API_BASE",
    "host": "HOST",
    "port": "PORT",
    "system_prompt": "SYSTEM_PROMPT",
}


class Settings:
    """应用配置，支持动态重载和持久化到 .env 文件"""

    def __init__(self):
        self.lock = threading.RLock()  # 可重入锁，update() 内调用 reload() 不会死锁
        self.reload()

    def reload(self):
        """从环境变量重新加载所有配置"""
        with self.lock:
            self.llm_api_key = os.getenv("LLM_API_KEY", "")
            self.llm_base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
            self.llm_model = os.getenv("LLM_MODEL", "gpt-4o")
            self.vector_store_path = os.getenv("VECTOR_STORE_PATH", "./data/vector_store")
            self.chunk_size = int(os.getenv("CHUNK_SIZE", "500"))
            self.chunk_overlap = int(os.getenv("CHUNK_OVERLAP", "50"))
            self.blog_api_base = os.getenv("BLOG_API_BASE", "http://localhost:8080/api")
            self.host = os.getenv("HOST", "0.0.0.0")
            self.port = int(os.getenv("PORT", "8000"))
            self.system_prompt = os.getenv("SYSTEM_PROMPT", "")

    def update(self, updates: dict):
        """更新配置并持久化到 .env 文件"""
        with self.lock:
            for key, value in updates.items():
                env_key = _ENV_MAPPING.get(key)
                if env_key:
                    os.environ[env_key] = str(value)
                    if ENV_FILE:
                        set_key(ENV_FILE, env_key, str(value))
            self.reload()

    def to_dict(self) -> dict:
        """返回当前配置（API key 脱敏）"""
        with self.lock:
            masked_key = "***"
            if self.llm_api_key and len(self.llm_api_key) > 8:
                masked_key = self.llm_api_key[:8] + "***"
            return {
                "llm_api_key": masked_key,
                "llm_base_url": self.llm_base_url,
                "llm_model": self.llm_model,
                "vector_store_path": self.vector_store_path,
                "chunk_size": self.chunk_size,
                "chunk_overlap": self.chunk_overlap,
                "blog_api_base": self.blog_api_base,
                "host": self.host,
                "port": self.port,
                "system_prompt": self.system_prompt,
            }


settings = Settings()
