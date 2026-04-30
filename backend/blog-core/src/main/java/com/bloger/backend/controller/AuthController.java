package com.bloger.backend.controller;

import com.bloger.backend.config.JwtUtil;
import com.bloger.backend.entity.User;
import com.bloger.backend.service.UserService;
import com.bloger.backend.util.ImagePathValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ImagePathValidator imagePathValidator;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtil.generateToken(username);

        User user = userService.getByUsername(username);
        if (user == null) {
            user = userService.getByEmail(username);
        }

        // 更新最后登录时间
        user.setLastLoginTime(new java.util.Date());
        userService.update(user);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        response.put("isAdmin", user.getAdmin() != null && user.getAdmin());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestParam String username, 
                                         @RequestParam String email, 
                                         @RequestParam String password, 
                                         @RequestParam(required = false) String avatar) {
        if (userService.getByUsername(username) != null) {
            return ResponseEntity.badRequest().build();
        }

        if (userService.getByEmail(email) != null) {
            return ResponseEntity.badRequest().build();
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setStatus(1);
        user.setEmailVerified(false);
        user.setLastLoginTime(null);

        if (avatar != null && !avatar.isEmpty()) {
            imagePathValidator.validateAvatarPath(avatar);
            user.setAvatar(avatar);
        }

        userService.save(user);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getByUsername(username);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }
}
