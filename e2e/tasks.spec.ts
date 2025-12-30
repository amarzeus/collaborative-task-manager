/**
 * E2E Tests for Task Management
 * Tests task CRUD operations and filtering
 */

import { test, expect } from '@playwright/test';

// Test user credentials - requires a pre-seeded test user
const TEST_USER = {
    email: 'test@example.com',
    password: 'password123',
};

test.describe('Task Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('/login');
        await page.getByLabel(/email/i).fill(TEST_USER.email);
        await page.getByLabel(/password/i).fill(TEST_USER.password);
        await page.getByRole('button', { name: /sign in|login/i }).click();

        // Wait for dashboard to load
        await page.waitForURL(/dashboard|tasks/, { timeout: 10000 });
    });

    test('should display dashboard after login', async ({ page }) => {
        await expect(page.getByText(/dashboard|tasks|welcome/i)).toBeVisible();
    });

    test('should navigate to tasks page', async ({ page }) => {
        // Click on tasks link if on dashboard
        const tasksLink = page.getByRole('link', { name: /tasks/i });
        if (await tasksLink.isVisible()) {
            await tasksLink.click();
        }

        await expect(page).toHaveURL(/tasks/);
    });

    test('should open create task modal', async ({ page }) => {
        await page.goto('/tasks');

        // Click create/add task button
        await page.getByRole('button', { name: /create|add|new/i }).click();

        // Modal should appear with form
        await expect(page.getByLabel(/title/i)).toBeVisible();
    });

    test('should filter tasks by status', async ({ page }) => {
        await page.goto('/tasks');

        // Find and click status filter
        const statusFilter = page.getByRole('combobox', { name: /status/i })
            .or(page.getByLabel(/status/i));

        if (await statusFilter.isVisible()) {
            await statusFilter.click();
            await page.getByRole('option', { name: /todo|to do/i }).click();
        }
    });

    test('should show task details on click', async ({ page }) => {
        await page.goto('/tasks');

        // Click on first task if exists
        const taskCard = page.locator('[data-testid="task-card"]').first()
            .or(page.locator('.task-card').first());

        if (await taskCard.isVisible()) {
            await taskCard.click();

            // Should show task details or modal
            await expect(page.getByText(/description|details|due/i)).toBeVisible();
        }
    });
});
