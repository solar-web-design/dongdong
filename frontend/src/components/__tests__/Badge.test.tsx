import { render, screen } from '@testing-library/react';
import Badge from '../Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>회장</Badge>);
    expect(screen.getByText('회장')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Badge>기본</Badge>);
    expect(screen.getByText('기본')).toHaveClass('bg-gray-100');
  });

  it('applies success variant', () => {
    render(<Badge variant="success">승인</Badge>);
    expect(screen.getByText('승인')).toHaveClass('bg-green-100');
  });

  it('applies warning variant', () => {
    render(<Badge variant="warning">대기</Badge>);
    expect(screen.getByText('대기')).toHaveClass('bg-yellow-100');
  });

  it('applies error variant', () => {
    render(<Badge variant="error">거부</Badge>);
    expect(screen.getByText('거부')).toHaveClass('bg-red-100');
  });

  it('applies info variant', () => {
    render(<Badge variant="info">정보</Badge>);
    expect(screen.getByText('정보')).toHaveClass('bg-blue-100');
  });

  it('applies custom className', () => {
    render(<Badge className="ml-2">테스트</Badge>);
    expect(screen.getByText('테스트')).toHaveClass('ml-2');
  });
});
