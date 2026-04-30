package com.bloger.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * AI 配置 DTO，用于与 FastAPI 服务交互
 * 使用 @JsonProperty 将 Java camelCase 映射为 Python snake_case
 */
@Data
public class AiConfigDTO {
    /** LLM API 密钥 */
    @JsonProperty("llm_api_key")
    private String llmApiKey;
    /** LLM API 基础地址 */
    @JsonProperty("llm_base_url")
    private String llmBaseUrl;
    /** LLM 模型名称 */
    @JsonProperty("llm_model")
    private String llmModel;
    /** RAG 文本分块大小 */
    @JsonProperty("chunk_size")
    private Integer chunkSize;
    /** RAG 文本分块重叠 */
    @JsonProperty("chunk_overlap")
    private Integer chunkOverlap;
    /** 系统提示词 */
    @JsonProperty("system_prompt")
    private String systemPrompt;
}
