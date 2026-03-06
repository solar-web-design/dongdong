import { render, screen } from '@testing-library/react';
import Providers from '../Providers';

jest.mock('@/lib/api', () => ({
  api: jest.fn().mockRejectedValue(new Error('not logged in')),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Providers', () => {
  it('renders children', () => {
    render(
      <Providers>
        <div data-testid="child">Hello</div>
      </Providers>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('wraps children with QueryClientProvider', () => {
    const { container } = render(
      <Providers>
        <span>Content</span>
      </Providers>
    );
    expect(container.innerHTML).toContain('Content');
  });
});
