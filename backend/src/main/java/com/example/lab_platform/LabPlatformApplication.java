package com.example.lab_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@EnableScheduling
@SpringBootApplication
public class LabPlatformApplication {

	public static void main(String[] args) {

		// Render (and most cloud hosts) run in UTC, but users enter booking
		// times in local time. Every LocalDateTime.now() in the app (status
		// scheduler, auto-complete, "past slot" checks) must use the same
		// clock the users book in, otherwise bookings stay "In Use" for
		// hours after they have ended. Override with APP_TIMEZONE if needed.
		String zone = System.getenv().getOrDefault("APP_TIMEZONE", "Asia/Kolkata");
		TimeZone.setDefault(TimeZone.getTimeZone(zone));

		SpringApplication.run(LabPlatformApplication.class, args);
	}

}