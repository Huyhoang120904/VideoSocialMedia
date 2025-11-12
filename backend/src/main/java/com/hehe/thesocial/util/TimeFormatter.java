package com.hehe.thesocial.util;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class TimeFormatter {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    /**
     * Format thời gian theo style TikTok (ngắn gọn, tiếng Việt)
     * - < 60 giây: "vừa xong"
     * - < 60 phút: "X phút" (ví dụ: "5 phút", "30 phút")
     * - < 24 giờ: "X giờ" (ví dụ: "2 giờ", "12 giờ")
     * - < 7 ngày: "X ngày" (ví dụ: "2 ngày", "5 ngày")
     * - >= 7 ngày: "dd-MM" (ví dụ: "25-7", "01-12")
     */
    public static String formatTimeAgo(Instant createdAt) {
        if (createdAt == null) {
            return "";
        }

        Instant now = Instant.now();
        long seconds = Duration.between(createdAt, now).getSeconds();

        // Debug log
        System.out.println("⏰ TimeFormatter - seconds: " + seconds);

        // < 60 giây → "vừa xong"
        if (seconds < 60) {
            return "vừa xong";
        }

        // < 60 phút → "X phút"
        long minutes = seconds / 60;
        if (minutes < 60) {
            return minutes + " phút";
        }

        // < 24 giờ → "X giờ"
        long hours = minutes / 60;
        if (hours < 24) {
            return hours + " giờ";
        }

        // < 7 ngày → "X ngày"
        long days = hours / 24;
        if (days < 7) {
            return days + " ngày";
        }

        // >= 7 ngày → "dd-MM"
        return DATE_FORMATTER.format(createdAt);
    }
}
