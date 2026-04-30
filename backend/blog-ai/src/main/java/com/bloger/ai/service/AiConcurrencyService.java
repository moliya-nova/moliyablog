package com.bloger.ai.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * AI 并发控制服务
 * 使用原子计数器限制同时使用 AI 的人数
 * （避免 Semaphore 实例替换导致的许可丢失问题）
 */
@Service
public class AiConcurrencyService {

    /** 最大并发数 */
    private final AtomicInteger maxConcurrency = new AtomicInteger(5);

    /** 当前活跃请求数 */
    private final AtomicInteger activeCount = new AtomicInteger(0);

    /**
     * 尝试获取许可（非阻塞，CAS 原子操作）
     * @return true=获取成功，false=已满
     */
    public boolean tryAcquire() {
        while (true) {
            int current = activeCount.get();
            int max = maxConcurrency.get();
            if (current >= max) {
                return false;
            }
            // CAS：仅当 activeCount 仍为 current 时才 +1
            if (activeCount.compareAndSet(current, current + 1)) {
                return true;
            }
        }
    }

    /**
     * 释放许可
     */
    public void release() {
        activeCount.decrementAndGet();
    }

    /**
     * 获取当前最大并发数设置
     */
    public int getMaxConcurrency() {
        return maxConcurrency.get();
    }

    /**
     * 获取当前可用许可数
     */
    public int availablePermits() {
        return Math.max(0, maxConcurrency.get() - activeCount.get());
    }

    /**
     * 设置最大并发数（立即生效，不影响在途请求）
     * @param max 最大并发数，必须 >= 1
     */
    public void setMaxConcurrency(int max) {
        if (max < 1) {
            throw new IllegalArgumentException("maxConcurrency 必须 >= 1");
        }
        maxConcurrency.set(max);
    }
}
