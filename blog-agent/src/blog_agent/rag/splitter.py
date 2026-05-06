"""博客文章切分工具 — 两阶段流水线

第一阶段：MarkdownHeaderTextSplitter 按标题层级切分
第二阶段：RecursiveCharacterTextSplitter 按字符数切分（chunk_size=500, overlap=50）
"""

import hashlib
from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)
from blog_agent.core.settings import settings
from blog_agent.core.logger import get_logger

logger = get_logger(__name__)

HEADERS_TO_SPLIT_ON = [
    ("#", "h1"),
    ("##", "h2"),
    ("###", "h3"),
    ("####", "h4"),
]

# 计算文本的MD5哈希值
def compute_md5(text: str) -> str:
    return hashlib.md5(text.encode("utf-8")).hexdigest()


# 两阶段切分博客文章，返回 (parent_id, 子块列表)
# 每个子块结构: {"chunk_id": "chunk_{article_id}_{index}_{hash8}", "page_content": "...", ...}
def split_article(
    article_id: int,
    title: str,
    url: str,
    content: str,
    content_hash: str | None = None,
) -> tuple[str, list[dict]]:
    if content_hash is None:
        content_hash = compute_md5(content)

    # 生成父类文章ID
    parent_id = f"art_{article_id}_{content_hash[:8]}"

    # ── 第一阶段：按 Markdown 标题切分 ──
    markdown_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=HEADERS_TO_SPLIT_ON,
        strip_headers=False,
    )
    md_docs = markdown_splitter.split_text(content)

    # ── 第二阶段：按字符数切分 ──
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", "。", ".", " ", ""],
    )

    chunks: list[dict] = []
    chunk_index = 0

    for md_doc in md_docs:
        # 构建标题路径，如 "Introduction > Background"
        heading_parts = []
        for key in ("h1", "h2", "h3", "h4"):
            val = md_doc.metadata.get(key)
            if val:
                heading_parts.append(val)
        heading_path = " > ".join(heading_parts) if heading_parts else ""

        # 二次切分
        sub_texts = text_splitter.split_text(md_doc.page_content)

        for text in sub_texts:
            chunk_hash = compute_md5(text)[:8]
            chunk_id = f"chunk_{article_id}_{chunk_index}_{chunk_hash}"

            chunks.append({
                "chunk_id": chunk_id,
                "page_content": text,
                "metadata": {
                    "parent_id": parent_id,
                    "article_id": article_id,
                    "article_title": title,
                    "article_url": url,
                    "chunk_index": chunk_index,
                    "heading_path": heading_path,
                    "content_hash": chunk_hash,
                },
            })
            chunk_index += 1

    logger.info(
        f"文章 {article_id} 切分完成: {len(chunks)} 个子块, parent_id={parent_id}"
    )
    return parent_id, chunks
