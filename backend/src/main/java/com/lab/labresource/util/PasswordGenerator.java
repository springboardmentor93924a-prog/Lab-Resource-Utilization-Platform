package com.lab.labresource.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String hash = "$2a$10$rIDReEtOx9o4aKv/jv/JsOoT2Mkb7WUZogInQeTrXeUuWO5ogtYw2";

        System.out.println(encoder.matches("admin123", hash));
    }
}