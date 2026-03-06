import { render } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner element', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="mt-8" />);
    expect(container.firstChild).toHaveClass('mt-8');
  });

  it('has default py-12 class', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toHaveClass('py-12');
  });
});
