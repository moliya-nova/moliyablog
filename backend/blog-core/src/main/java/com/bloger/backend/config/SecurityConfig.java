package com.bloger.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/articles/**").permitAll()
            .requestMatchers("/api/categories/**").permitAll()
            .requestMatchers("/api/tags/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/comments/**").authenticated()
            .requestMatchers(HttpMethod.PUT, "/api/comments/**").authenticated()
            .requestMatchers(HttpMethod.DELETE, "/api/comments/**").authenticated()
            .requestMatchers("/api/guestbook/**").permitAll()
            .requestMatchers("/api/carousel-slides/**").permitAll()
            .requestMatchers("/api/site-settings/**").permitAll()
            .requestMatchers("/api/about-page/**").permitAll()
            .requestMatchers("/api/files/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/friend-links/public").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/friend-link-applies").permitAll()
            .anyRequest().authenticated()
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
