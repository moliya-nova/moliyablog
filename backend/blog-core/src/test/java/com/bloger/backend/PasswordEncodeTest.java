package com.bloger.backend;


import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
public class PasswordEncodeTest {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void testEncode() {
        String raw = "123456";
        String encode = passwordEncoder.encode(raw);
        System.out.println("BCrypt加密后：" + encode);
    }
}
