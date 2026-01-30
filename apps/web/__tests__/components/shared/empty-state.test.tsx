import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '@/components/shared/empty-state';
import { FileText } from 'lucide-react';

describe('EmptyState', () => {
  const defaultProps = {
    icon: FileText,
    title: 'No items found',
    description: 'Get started by creating your first item.',
  };

  it('renders icon, title, and description', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first item.')).toBeInTheDocument();
  });

  it('renders without action by default', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders action button with onClick handler', () => {
    const handleClick = vi.fn();

    render(
      <EmptyState
        {...defaultProps}
        action={{
          label: 'Create Item',
          onClick: handleClick,
        }}
      />
    );

    const button = screen.getByRole('button', { name: 'Create Item' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders action as link when href is provided', () => {
    render(
      <EmptyState
        {...defaultProps}
        action={{
          label: 'Create Item',
          href: '/items/new',
        }}
      />
    );

    const link = screen.getByRole('link', { name: 'Create Item' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/items/new');
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState {...defaultProps} className="custom-class" />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('renders with centered layout', () => {
    const { container } = render(<EmptyState {...defaultProps} />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('flex-col');
    expect(wrapper).toHaveClass('items-center');
    expect(wrapper).toHaveClass('justify-center');
    expect(wrapper).toHaveClass('text-center');
  });

  it('renders icon in muted background circle', () => {
    const { container } = render(<EmptyState {...defaultProps} />);

    const iconWrapper = container.querySelector('.rounded-full.bg-muted');
    expect(iconWrapper).toBeInTheDocument();
  });

  it('renders title as h3', () => {
    render(<EmptyState {...defaultProps} />);

    const title = screen.getByRole('heading', { level: 3, name: 'No items found' });
    expect(title).toBeInTheDocument();
  });

  it('renders description with muted styling', () => {
    render(<EmptyState {...defaultProps} />);

    const description = screen.getByText('Get started by creating your first item.');
    expect(description).toHaveClass('text-muted-foreground');
  });
});
