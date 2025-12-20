/**
 * Unit tests for Button component
 * Tests UI component rendering and interactions
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';

describe('Button Component', () => {
    /**
     * Test 1: Renders button with text
     */
    it('should render button with text', () => {
        render(<Button>Click me</Button>);

        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    /**
     * Test 2: Handles click events
     */
    it('should handle click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        fireEvent.click(screen.getByRole('button'));

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    /**
     * Test 3: Renders with left icon
     */
    it('should render with left icon', () => {
        render(<Button leftIcon={<Plus data-testid="icon" />}>Add</Button>);

        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(screen.getByText('Add')).toBeInTheDocument();
    });

    /**
     * Test 4: Shows loading state
     */
    it('should show loading state and disable button', () => {
        render(<Button isLoading>Submit</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    /**
     * Test 5: Applies variant styles correctly
     */
    it('should apply different variant styles', () => {
        // Primary uses gradient (from-indigo-500)
        const { rerender } = render(<Button variant="primary">Primary</Button>);
        expect(screen.getByRole('button')).toHaveClass('from-indigo-500');

        // Secondary uses solid bg-slate-700
        rerender(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-slate-700');

        // Danger uses bg-red-500
        rerender(<Button variant="danger">Danger</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-red-500');

        // Ghost uses bg-transparent
        rerender(<Button variant="ghost">Ghost</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });

    /**
     * Test 6: Applies size styles correctly
     */
    it('should apply different size styles', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5');

        rerender(<Button size="md">Medium</Button>);
        expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3');
    });
});
