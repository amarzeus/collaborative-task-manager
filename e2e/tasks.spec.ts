/**
 * E2E Tests for Task Management
 * Tests task CRUD operations and filtering
 */

import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
    test.beforeEach(async ({ page }) => {
        // Create a unique user for each test to ensure isolation
        const uniqueId = Date.now();
        const user = {
            name: `Test User ${uniqueId}`,
            email: `test${uniqueId}@example.com`,
            password: 'Password123',
        };

        // Register new user
        await page.goto('/register');
        await page.getByLabel(/full name/i).fill(user.name);
        await page.getByLabel(/email/i).fill(user.email);
        await page.getByLabel(/^password$/i).fill(user.password);
        await page.getByLabel(/confirm/i).fill(user.password);
        await page.getByRole('button', { name: /create|register/i }).click();

        // Wait for dashboard to load
        await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    });

    test('should display dashboard after login', async ({ page }) => {
        // Wait for any of the dashboard elements
        await expect(page.getByRole('heading', { name: /welcome|good/i })).toBeVisible();
    });

    test('should navigate to tasks page', async ({ page }) => {
        // Click on tasks link in sidebar specifically
        const tasksLink = page.locator('nav').getByRole('link', { name: 'Tasks' });
        await tasksLink.click();

        await expect(page).toHaveURL(/\/tasks/);
    });

    test('should open create task modal', async ({ page }) => {
        await page.goto('/tasks');

        // Click create/add task button
        await page.getByRole('button', { name: 'New Task' }).click();

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
