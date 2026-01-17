/**
 * Tests for Loading UI Components
 * 
 * These tests verify that loading components render correctly with different props.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
    Spinner,
    Skeleton,
    SkeletonText,
    ProgressBar,
    CircularProgress,
    InlineLoading,
    ButtonLoading,
} from './Loading';

// =============================================================================
// Spinner Component
// =============================================================================
describe('Spinner', () => {
    it('renders with default props', () => {
        const { container } = render(<Spinner />);
        const spinner = container.firstChild;
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('animate-spin');
    });

    it('applies size classes correctly', () => {
        const { container: containerSm } = render(<Spinner size="sm" />);
        expect(containerSm.firstChild).toHaveClass('w-5', 'h-5');

        const { container: containerLg } = render(<Spinner size="lg" />);
        expect(containerLg.firstChild).toHaveClass('w-12', 'h-12');
    });

    it('applies custom className', () => {
        const { container } = render(<Spinner className="custom-class" />);
        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies color variants', () => {
        const { container: containerWhite } = render(<Spinner color="white" />);
        expect(containerWhite.firstChild).toHaveClass('border-white');

        const { container: containerPrimary } = render(<Spinner color="primary" />);
        expect(containerPrimary.firstChild).toHaveClass('border-indigo-500');
    });
});

// =============================================================================
// Skeleton Component
// =============================================================================
describe('Skeleton', () => {
    it('renders with default props', () => {
        const { container } = render(<Skeleton />);
        expect(container.firstChild).toBeInTheDocument();
        expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('applies circular variant', () => {
        const { container } = render(<Skeleton variant="circular" />);
        expect(container.firstChild).toHaveClass('rounded-full');
    });

    it('applies custom dimensions', () => {
        const { container } = render(<Skeleton width="100px" height="50px" />);
        expect(container.firstChild).toHaveStyle({ width: '100px', height: '50px' });
    });

    it('applies pulse animation', () => {
        const { container } = render(<Skeleton animation="pulse" />);
        expect(container.firstChild).toHaveClass('animate-pulse');
    });
});

// =============================================================================
// SkeletonText Component
// =============================================================================
describe('SkeletonText', () => {
    it('renders default 3 lines', () => {
        const { container } = render(<SkeletonText />);
        const lines = container.querySelectorAll('[class*="h-4"]');
        expect(lines.length).toBe(3);
    });

    it('renders specified number of lines', () => {
        const { container } = render(<SkeletonText lines={5} />);
        const lines = container.querySelectorAll('[class*="h-4"]');
        expect(lines.length).toBe(5);
    });

    it('last line is shorter', () => {
        const { container } = render(<SkeletonText lines={3} />);
        const lines = container.querySelectorAll('[class*="h-4"]');
        const lastLine = lines[lines.length - 1];
        expect(lastLine).toHaveClass('w-3/4');
    });
});

// =============================================================================
// ProgressBar Component
// =============================================================================
describe('ProgressBar', () => {
    it('renders with default value of 0', () => {
        const { container } = render(<ProgressBar />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('shows label when showLabel is true', () => {
        render(<ProgressBar value={50} max={100} showLabel />);
        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('clamps value to 0-100 range', () => {
        // Value above max
        render(<ProgressBar value={150} max={100} showLabel />);
        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('applies color variants', () => {
        const { container } = render(<ProgressBar color="success" value={50} />);
        const progressFill = container.querySelector('[class*="from-emerald"]');
        expect(progressFill).toBeInTheDocument();
    });

    it('applies size variants', () => {
        const { container } = render(<ProgressBar size="lg" />);
        const bar = container.querySelector('.h-3');
        expect(bar).toBeInTheDocument();
    });
});

// =============================================================================
// CircularProgress Component
// =============================================================================
describe('CircularProgress', () => {
    it('renders SVG element', () => {
        const { container } = render(<CircularProgress />);
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('shows value by default', () => {
        render(<CircularProgress value={75} />);
        expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('hides value when showValue is false', () => {
        render(<CircularProgress value={75} showValue={false} />);
        expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });

    it('renders with custom size', () => {
        const { container } = render(<CircularProgress size={100} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '100');
        expect(svg).toHaveAttribute('height', '100');
    });
});

// =============================================================================
// InlineLoading Component
// =============================================================================
describe('InlineLoading', () => {
    it('renders with default text', () => {
        render(<InlineLoading />);
        expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('renders with custom text', () => {
        render(<InlineLoading text="Please wait" />);
        expect(screen.getByText('Please wait')).toBeInTheDocument();
    });

    it('includes spinner', () => {
        const { container } = render(<InlineLoading />);
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
});

// =============================================================================
// ButtonLoading Component
// =============================================================================
describe('ButtonLoading', () => {
    it('renders children when not loading', () => {
        render(<ButtonLoading>Click Me</ButtonLoading>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('shows loading text when loading', () => {
        render(<ButtonLoading loading>Click Me</ButtonLoading>);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByText('Click Me')).not.toBeInTheDocument();
    });

    it('shows custom loading text', () => {
        render(<ButtonLoading loading loadingText="Saving...">Save</ButtonLoading>);
        expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('includes spinner when loading', () => {
        const { container } = render(<ButtonLoading loading>Click</ButtonLoading>);
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
});
