import { render, screen } from '@testing-library/react';
import Avatar from '../Avatar';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

describe('Avatar', () => {
  it('renders initials when no src', () => {
    render(<Avatar name="홍길동" />);
    expect(screen.getByText('홍')).toBeInTheDocument();
  });

  it('renders image when src provided', () => {
    render(<Avatar name="홍길동" src="/avatar.jpg" />);
    const img = screen.getByAltText('홍길동');
    expect(img).toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { container } = render(<Avatar name="김" size="lg" />);
    expect(container.firstChild).toHaveClass('w-14', 'h-14');
  });

  it('defaults to md size', () => {
    const { container } = render(<Avatar name="김" />);
    expect(container.firstChild).toHaveClass('w-10', 'h-10');
  });

  it('applies custom className', () => {
    const { container } = render(<Avatar name="김" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
