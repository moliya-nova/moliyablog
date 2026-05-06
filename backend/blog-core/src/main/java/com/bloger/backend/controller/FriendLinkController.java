package com.bloger.backend.controller;

import com.bloger.backend.entity.FriendLink;
import com.bloger.backend.service.FriendLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friend-links")
public class FriendLinkController {

    @Autowired
    private FriendLinkService friendLinkService;

    @GetMapping
    public List<FriendLink> list() {
        return friendLinkService.listAll();
    }

    @GetMapping("/public")
    public List<FriendLink> listPublic() {
        return friendLinkService.list();
    }

    @GetMapping("/count")
    public long count() {
        return friendLinkService.count();
    }

    @GetMapping("/{id}")
    public FriendLink getById(@PathVariable Long id) {
        return friendLinkService.getById(id);
    }

    @PostMapping
    public void save(@RequestBody FriendLink friendLink) {
        friendLinkService.save(friendLink);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody FriendLink friendLink) {
        friendLink.setId(id);
        friendLinkService.update(friendLink);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        friendLinkService.delete(id);
    }

    @PostMapping("/{id}/check")
    public Map<String, Object> checkStatus(@PathVariable Long id) {
        friendLinkService.checkStatus(id);
        FriendLink friendLink = friendLinkService.getById(id);
        Map<String, Object> result = new HashMap<>();
        result.put("isAlive", friendLink.getIsAlive() == 1);
        return result;
    }

    @PostMapping("/check-all")
    public void checkAllStatus() {
        friendLinkService.checkAllStatus();
    }
}
