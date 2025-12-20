/**
 * Unit tests for Card component
 * Tests card layout component rendering
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';

describe('Card Component', () => {
    /**
     * Test 1: Renders Card with children
     */
    it('should render Card with children', () => {
        render(
            <Card>
                <div>Card content</div>
            </Card>
        );

        expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    /**
     * Test 2: Renders CardHeader
     */
    it('should render CardHeader with title', () => {
        render(
            <Card>
                <CardHeader>
                    <h2>Card Title</h2>
                </CardHeader>
            </Card>
        );

        expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    /**
     * Test 3: Renders CardBody
     */
    it('should render CardBody with content', () => {
        render(
            <Card>
                <CardBody>
                    <p>Body content here</p>
                </CardBody>
            </Card>
        );

        expect(screen.getByText('Body content here')).toBeInTheDocument();
    });

    /**
     * Test 4: Applies custom className
     */
    it('should apply custom className to Card', () => {
        render(
            <Card className="custom-class">
                <div>Content</div>
            </Card>
        );

        const card = screen.getByText('Content').parentElement;
        expect(card).toHaveClass('custom-class');
    });
});
