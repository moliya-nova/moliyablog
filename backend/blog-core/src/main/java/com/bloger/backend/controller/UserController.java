package com.bloger.backend.controller;

import com.bloger.backend.entity.User;
import com.bloger.backend.service.UserService;
import com.bloger.backend.util.ImagePathValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ImagePathValidator imagePathValidator;

    @GetMapping
    public List<User> list() {
        return userService.list();
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @PostMapping
    public void save(@RequestBody User user) {
        imagePathValidator.validateAvatarPath(user.getAvatar());
        userService.save(user);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody User user) {
        imagePathValidator.validateAvatarPath(user.getAvatar());
        user.setId(id);
        userService.update(user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}