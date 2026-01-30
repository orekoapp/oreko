import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Draft</Badge>);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-primary');
    expect(badge).toHaveClass('text-primary-foreground');
  });

  it('renders with secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-secondary');
    expect(badge).toHaveClass('text-secondary-foreground');
  });

  it('renders with destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Delete</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-destructive');
  });

  it('renders with outline variant', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('text-foreground');
  });

  it('renders with success variant', () => {
    const { container } = render(<Badge variant="success">Paid</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  it('renders with warning variant', () => {
    const { container } = render(<Badge variant="warning">Pending</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-yellow-100');
    expect(badge).toHaveClass('text-yellow-800');
  });

  it('renders with info variant', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="my-custom-class">Custom</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('my-custom-class');
  });

  it('has rounded corners', () => {
    const { container } = render(<Badge>Rounded</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('rounded-md');
  });

  it('has proper padding', () => {
    const { container } = render(<Badge>Padded</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
  });

  it('uses inline-flex display', () => {
    const { container } = render(<Badge>Flex</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
  });

  it('passes additional props', () => {
    render(<Badge data-testid="test-badge">Test</Badge>);
    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
  });
});
