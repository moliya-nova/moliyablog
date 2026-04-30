package com.bloger.backend.controller;

import com.bloger.backend.entity.Guestbook;
import com.bloger.backend.service.GuestbookService;
import com.bloger.backend.util.ImagePathValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/guestbook")
public class GuestbookController {

    @Autowired
    private GuestbookService guestbookService;

    @Autowired
    private ImagePathValidator imagePathValidator;

    @GetMapping
    public List<Guestbook> list() {
        return guestbookService.listAll();
    }

    @GetMapping("/public")
    public List<Guestbook> listPublic() {
        return guestbookService.listByStatus(1);
    }

    @GetMapping("/{id}")
    public Guestbook getById(@PathVariable Long id) {
        return guestbookService.getById(id);
    }

    @GetMapping("/count")
    public long count() {
        return guestbookService.count();
    }

    @PostMapping
    public void save(@RequestBody Guestbook guestbook) {
        imagePathValidator.validateAvatarPath(guestbook.getAuthorAvatar());
        guestbookService.save(guestbook);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody Guestbook guestbook) {
        imagePathValidator.validateAvatarPath(guestbook.getAuthorAvatar());
        guestbook.setId(id);
        guestbookService.update(guestbook);
    }

    @PostMapping("/{id}/reply")
    public void reply(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String reply = payload.get("reply");
        guestbookService.reply(id, reply);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        guestbookService.delete(id);
    }
}