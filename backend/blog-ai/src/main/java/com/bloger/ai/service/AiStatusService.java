package com.bloger.ai.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * AI 服务状态管理
 * 跟踪启用/禁用状态、请求计数、活跃连接数
 */
@Service
public class AiStatusService {

    /** AI 服务是否启用 */
    private final AtomicBoolean enabled = new AtomicBoolean(true);

    /** 累计请求总数 */
    private final AtomicLong totalRequests = new AtomicLong(0);

    /** 当前活跃 SSE 连接数 */
    private final AtomicLong activeConnections = new AtomicLong(0);

    public boolean isEnabled() {
        return enabled.get();
    }

    public void setEnabled(boolean value) {
        enabled.set(value);
    }

    public void toggle() {
        boolean prev;
        do {
            prev = enabled.get();
        } while (!enabled.compareAndSet(prev, !prev));
    }

    public long incrementRequests() {
        return totalRequests.incrementAndGet();
    }

    public long getTotalRequests() {
        return totalRequests.get();
    }

    public long incrementConnections() {
        return activeConnections.incrementAndGet();
    }

    public long decrementConnections() {
        return activeConnections.decrementAndGet();
    }

    public long getActiveConnections() {
        return activeConnections.get();
    }
}
