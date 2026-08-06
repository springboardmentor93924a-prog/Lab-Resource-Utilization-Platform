package com.example.lab_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class LabPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(LabPlatformApplication.class, args);
	}

}
