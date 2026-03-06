import { render, screen } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="데이터 없음" />);
    expect(screen.getByText('데이터 없음')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="없음" description="새로 만들어보세요" />);
    expect(screen.getByText('새로 만들어보세요')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="없음" />);
    expect(container.querySelectorAll('p').length).toBe(0);
  });

  it('renders icon when provided', () => {
    render(<EmptyState title="없음" icon={<span data-testid="icon">🔔</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<EmptyState title="없음" action={<button>추가</button>} />);
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<EmptyState title="없음" className="my-custom" />);
    expect(container.firstChild).toHaveClass('my-custom');
  });
});
