package com.bloger.backend.service;

import java.util.Map;

public interface CosSyncService {
    void syncFromCos();
    Map<String, Object> getSyncProgress();
}