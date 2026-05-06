package com.bloger.backend.controller;

import com.bloger.backend.entity.FriendLinkApply;
import com.bloger.backend.service.FriendLinkApplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friend-link-applies")
public class FriendLinkApplyController {

    @Autowired
    private FriendLinkApplyService friendLinkApplyService;

    @GetMapping
    public List<FriendLinkApply> list() {
        return friendLinkApplyService.list();
    }

    @GetMapping("/pending")
    public List<FriendLinkApply> listPending() {
        return friendLinkApplyService.listByStatus(0);
    }

    @GetMapping("/{id}")
    public FriendLinkApply getById(@PathVariable Long id) {
        return friendLinkApplyService.getById(id);
    }

    @PostMapping
    public void save(@RequestBody FriendLinkApply apply) {
        friendLinkApplyService.save(apply);
    }

    @PutMapping("/{id}/approve")
    public void approve(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        String reply = payload != null ? payload.get("reply") : null;
        friendLinkApplyService.approve(id, reply);
    }

    @PutMapping("/{id}/reject")
    public void reject(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        String reply = payload != null ? payload.get("reply") : null;
        friendLinkApplyService.reject(id, reply);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        friendLinkApplyService.delete(id);
    }
}
