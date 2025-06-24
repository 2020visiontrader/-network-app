# Race Condition Analysis Report

**Generated:** 2025-06-23T18:32:13.368Z

## Summary

- Total operations analyzed: 3
- Total function calls: 5
- Operations with race conditions: 2

## Operation Statistics

| Operation | Calls | Avg Attempts | Avg Time (ms) | Race Condition Rate |
|-----------|-------|--------------|---------------|---------------------|
| dashboard-profile-fetch | 2 | 2.50 | 1225 | 100.0% |
| profile-update | 2 | 1.00 | 383 | 0.0% |
| onboarding-completion | 1 | 5.00 | 3200 | 100.0% |

## Recommendations

### HIGH: dashboard-profile-fetch

**Issue:** High race condition rate (100.0%)

**Suggestion:** Increase retry count to at least 5 and verify write operations more thoroughly

### HIGH: onboarding-completion

**Issue:** High race condition rate (100.0%)

**Suggestion:** Increase retry count to at least 8 and verify write operations more thoroughly

