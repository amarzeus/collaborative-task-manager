/**
 * Unit tests for StatsCard component
 * Tests dashboard stats display with trends and sparklines
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { CheckCircle } from 'lucide-react';

describe('StatsCard Component', () => {
    const defaultProps = {
        title: 'Total Tasks',
        value: 42,
        icon: CheckCircle,
        color: 'indigo' as const,
    };

    /**
     * Test 1: Renders title and value
     */
    it('should render title and value', () => {
        render(<StatsCard {...defaultProps} />);

        expect(screen.getByText('Total Tasks')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    /**
     * Test 2: Formats large numbers with commas
     */
    it('should format large numbers with commas', () => {
        render(<StatsCard {...defaultProps} value={1234567} />);

        expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    /**
     * Test 3: Shows positive trend indicator
     */
    it('should show positive trend with up arrow', () => {
        render(<StatsCard {...defaultProps} trend={15} />);

        expect(screen.getByText('15%')).toBeInTheDocument();
        expect(screen.getByText('▲')).toBeInTheDocument();
    });

    /**
     * Test 4: Shows negative trend indicator
     */
    it('should show negative trend with down arrow', () => {
        render(<StatsCard {...defaultProps} trend={-10} />);

        expect(screen.getByText('10%')).toBeInTheDocument();
        expect(screen.getByText('▼')).toBeInTheDocument();
    });

    /**
     * Test 5: Renders subtitle when provided
     */
    it('should render subtitle when provided', () => {
        render(<StatsCard {...defaultProps} subtitle="Last 7 days" />);

        expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    });

    /**
     * Test 6: Calls onClick when clicked
     */
    it('should call onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<StatsCard {...defaultProps} onClick={handleClick} />);

        fireEvent.click(screen.getByText('Total Tasks').closest('div')!);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    /**
     * Test 7: Shows live indicator
     */
    it('should show live indicator', () => {
        render(<StatsCard {...defaultProps} />);

        expect(screen.getByText('Live')).toBeInTheDocument();
    });

    /**
     * Test 8: Applies correct color theme
     */
    it('should apply different color themes', () => {
        const { rerender } = render(<StatsCard {...defaultProps} color="green" />);
        expect(screen.getByText('Total Tasks')).toHaveClass('text-emerald-400');

        rerender(<StatsCard {...defaultProps} color="red" />);
        expect(screen.getByText('Total Tasks')).toHaveClass('text-red-400');
    });
});
