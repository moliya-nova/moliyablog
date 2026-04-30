package com.bloger.ai.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * AI 服务统计 DTO
 */
@Data
public class AiStatsDTO {
    /** 累计请求总数 */
    private long totalRequests;
    /** 当前活跃连接数 */
    private int activeConnections;
    /** 最大并发数 */
    private int maxConcurrency;
    /** 是否启用 */
    private boolean enabled;
    /** 活跃会话线程列表 */
    private List<Map<String, Object>> activeThreads;
}
