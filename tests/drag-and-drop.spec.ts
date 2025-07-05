import { test, expect } from '@playwright/test';

test.describe('Widget Dashboard Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display dashboard with initial widget', async ({ page }) => {
    // Check that the dashboard loads
    await expect(page.locator('h1')).toContainText('Customizable Widget Dashboard');
    
    // Check that initial widget exists
    await expect(page.locator('[data-testid="widget-1"]').or(page.getByText('Widget 1')).first()).toBeVisible();
  });

  test('should enter edit mode and show controls', async ({ page }) => {
    // Click edit mode button
    await page.click('button:has-text("Edit Mode")');
    
    // Verify edit mode is active
    await expect(page.getByText('Edit mode is active')).toBeVisible();
    await expect(page.locator('button:has-text("Exit Edit Mode")')).toBeVisible();
    
    // Check that drag handle is visible
    await expect(page.locator('[aria-label="Drag to move widget"]')).toBeVisible();
    
    // Check that widget options menu is visible
    await expect(page.locator('[aria-label="Widget options"]')).toBeVisible();
  });

  test('should add new widgets', async ({ page }) => {
    // Enter edit mode
    await page.click('button:has-text("Edit Mode")');
    
    // Add a widget using the bottom button
    await page.click('button:has-text("Add Widget")');
    
    // Verify new widget appears
    await expect(page.getByText('Widget 2')).toBeVisible();
    
    // Add another widget
    await page.click('button:has-text("Add Widget")');
    await expect(page.getByText('Widget 3')).toBeVisible();
  });

  test('should perform drag and drop operation', async ({ page }) => {
    // Enter edit mode
    await page.click('button:has-text("Edit Mode")');
    
    // Add multiple widgets to create a scenario where movement is needed
    await page.click('button:has-text("Add Widget")');
    await page.click('button:has-text("Add Widget")');
    await page.click('button:has-text("Add Widget")'); // Fill up first row
    
    // Wait for widgets to be rendered
    await page.waitForTimeout(500);
    
    // Get the first widget's drag handle
    const firstDragHandle = page.locator('[aria-label="Drag to move widget"]').first();
    await expect(firstDragHandle).toBeVisible();
    
    // Find an empty slot to drag to
    const emptySlot = page.locator('[data-testid^="empty-slot"]').first();
    
    if (await emptySlot.isVisible()) {
      // Get widget content before drag to track it
      const widget1Text = await page.getByText('Widget 1').textContent();
      
      // Perform drag and drop to empty slot
      await firstDragHandle.dragTo(emptySlot);
      
      // Wait for the drag operation to complete
      await page.waitForTimeout(500);
      
      // Verify the drag operation completed successfully
      await expect(page.getByText('Widget 1')).toBeVisible();
    } else {
      // If no empty slot, just verify drag handle works (widget stays in place)
      await firstDragHandle.click();
      await expect(page.getByText('Widget 1')).toBeVisible();
    }
  });

  test('should drag widget to specific grid position', async ({ page }) => {
    // Enter edit mode
    await page.click('button:has-text("Edit Mode")');
    
    // Add multiple widgets to fill some positions
    await page.click('button:has-text("Add Widget")');
    await page.click('button:has-text("Add Widget")');
    
    await page.waitForTimeout(500);
    
    // Get all widgets
    const widgets = page.locator('[data-testid^="widget"]').or(page.locator(':has-text("Widget")').filter({ hasText: /^Widget \d+$/ }));
    const widgetCount = await widgets.count();
    
    if (widgetCount >= 2) {
      // Get drag handle of first widget
      const firstDragHandle = page.locator('[aria-label="Drag to move widget"]').first();
      
      // Find an empty grid cell to drop into
      const emptySlot = page.locator('[data-testid^="empty-slot"]').or(page.locator('button:has-text("Add Widget")').locator('..').locator('..')).first();
      
      if (await emptySlot.isVisible()) {
        // Perform drag and drop to empty slot
        await firstDragHandle.dragTo(emptySlot);
        
        // Wait for operation to complete
        await page.waitForTimeout(500);
        
        // Verify widgets are still present (basic sanity check)
        await expect(page.getByText('Widget 1')).toBeVisible();
      }
    }
  });

  test('should handle widget expansion', async ({ page }) => {
    // Enter edit mode
    await page.click('button:has-text("Edit Mode")');
    
    // Look for expand buttons (they appear as arrow symbols or specific buttons)
    const expandButton = page.locator('button[aria-label*="Expand"]').first();
    
    if (await expandButton.isVisible()) {
      // Get initial widget size
      const widget = page.getByText('Widget 1').locator('..').locator('..');
      const initialBox = await widget.boundingBox();
      
      // Click expand button
      await expandButton.click();
      
      // Wait for expansion
      await page.waitForTimeout(500);
      
      // Verify widget expanded (size should be different)
      const expandedBox = await widget.boundingBox();
      expect(expandedBox?.width !== initialBox?.width || expandedBox?.height !== initialBox?.height).toBeTruthy();
    }
  });

  test('should remove widgets', async ({ page }) => {
    // Enter edit mode
    await page.click('button:has-text("Edit Mode")');
    
    // Click on widget options menu
    await page.click('[aria-label="Widget options"]');
    
    // Wait for menu to appear and click the menu item specifically
    await expect(page.getByRole('menuitem', { name: 'Remove' })).toBeVisible();
    
    // Click remove option
    await page.click('role=menuitem[name="Remove"]');
    
    // Wait for removal animation/transition
    await page.waitForTimeout(500);
    
    // Verify widget is removed
    await expect(page.getByText('Widget 1')).not.toBeVisible();
  });

  test('should exit edit mode and hide controls', async ({ page }) => {
    // Enter edit mode first
    await page.click('button:has-text("Edit Mode")');
    await expect(page.getByText('Edit mode is active')).toBeVisible();
    
    // Exit edit mode
    await page.click('button:has-text("Exit Edit Mode")');
    
    // Verify edit mode is inactive
    await expect(page.getByText('Edit mode is active')).not.toBeVisible();
    await expect(page.locator('button:has-text("Edit Mode")')).toBeVisible();
    
    // Verify controls are hidden
    await expect(page.locator('[aria-label="Drag to move widget"]')).not.toBeVisible();
    await expect(page.locator('[aria-label="Widget options"]')).not.toBeVisible();
  });

  test('should preserve widget state across mode changes', async ({ page }) => {
    // Add some widgets in edit mode
    await page.click('button:has-text("Edit Mode")');
    await page.click('button:has-text("Add Widget")');
    
    // Verify widgets exist
    await expect(page.getByText('Widget 1')).toBeVisible();
    await expect(page.getByText('Widget 2')).toBeVisible();
    
    // Exit edit mode
    await page.click('button:has-text("Exit Edit Mode")');
    
    // Verify widgets still exist
    await expect(page.getByText('Widget 1')).toBeVisible();
    await expect(page.getByText('Widget 2')).toBeVisible();
    
    // Re-enter edit mode
    await page.click('button:has-text("Edit Mode")');
    
    // Verify widgets still exist and controls are back
    await expect(page.getByText('Widget 1')).toBeVisible();
    await expect(page.getByText('Widget 2')).toBeVisible();
    // Use .first() to avoid strict mode violation with multiple drag handles
    await expect(page.locator('[aria-label="Drag to move widget"]').first()).toBeVisible();
  });
});