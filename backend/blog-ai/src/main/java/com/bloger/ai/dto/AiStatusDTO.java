package com.bloger.ai.dto;

import lombok.Data;

/**
 * AI 服务状态 DTO
 */
@Data
public class AiStatusDTO {
    /** 是否启用 */
    private boolean enabled;
    /** 最大并发数 */
    private int maxConcurrency;
    /** 当前活跃连接数 */
    private int activeConnections;
    /** 累计请求总数 */
    private long totalRequests;
    /** 状态描述信息 */
    private String message;
}
