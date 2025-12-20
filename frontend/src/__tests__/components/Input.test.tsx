/**
 * Unit tests for Input component
 * Tests form input rendering and validation states
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../../components/ui/Input';

describe('Input Component', () => {
    /**
     * Test 1: Renders input with label (requires name/id for association)
     */
    it('should render input with label', () => {
        render(<Input label="Email" name="email" placeholder="Enter email" />);

        // The label and input should be connected via htmlFor/id
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    /**
     * Test 2: Shows error message
     */
    it('should display error message when provided', () => {
        render(<Input label="Email" name="email" error="Email is required" />);

        expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    /**
     * Test 3: Handles value changes
     */
    it('should handle value changes', () => {
        const handleChange = vi.fn();
        render(<Input label="Name" name="name" onChange={handleChange} />);

        const input = screen.getByLabelText('Name');
        fireEvent.change(input, { target: { value: 'John' } });

        expect(handleChange).toHaveBeenCalled();
    });

    /**
     * Test 4: Renders with placeholder only (no label)
     */
    it('should render with placeholder only', () => {
        render(<Input placeholder="Enter your email" />);

        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    /**
     * Test 5: Applies error styles when error is present
     */
    it('should apply error styles when error is present', () => {
        render(<Input name="email" error="Invalid email" />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('border-red-500');
    });
});
