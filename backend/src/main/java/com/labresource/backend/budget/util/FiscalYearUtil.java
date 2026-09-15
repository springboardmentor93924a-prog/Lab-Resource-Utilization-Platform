package com.labresource.backend.budget.util;

import java.time.LocalDate;

/**
 * Utility class for dynamically calculating Indian Fiscal Year (April to March).
 * Example: September 2026 -> "2026-2027"
 * Example: February 2027 -> "2026-2027"
 */
public class FiscalYearUtil {

    public static String getCurrentFiscalYear() {
        return getFiscalYearForDate(LocalDate.now());
    }

    public static String getFiscalYearForDate(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        int year = date.getMonthValue() >= 4 ? date.getYear() : date.getYear() - 1;
        return year + "-" + (year + 1);
    }
}
