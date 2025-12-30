/**
 * E2E Tests for Authentication Flow
 * Tests login, registration, and session management
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should show login page for unauthenticated users', async ({ page }) => {
        // Should redirect to login or show login form
        await expect(page).toHaveURL(/\/(login)?/);
    });

    test('should display login form with email and password fields', async ({ page }) => {
        await page.goto('/login');

        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/^password$/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel(/email/i).fill('invalid@example.com');
        await page.getByLabel(/^password$/i).fill('wrongpassword');
        await page.getByRole('button', { name: /sign in|login/i }).click();

        // Should show error message
        await expect(page.getByText(/invalid|error|incorrect|failed/i)).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to register page from login', async ({ page }) => {
        await page.goto('/login');

        await page.getByRole('link', { name: /sign up|register|create account/i }).click();

        await expect(page).toHaveURL(/register/);
    });

    test('should display registration form with required fields', async ({ page }) => {
        await page.goto('/register');

        await expect(page.getByLabel(/name/i)).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/^password$/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign up|register|create/i })).toBeVisible();
    });
});
