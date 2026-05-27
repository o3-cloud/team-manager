import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies extra className', () => {
    const { container } = render(<Card className="extra">Content</Card>);
    expect(container.firstChild).toHaveClass('extra');
  });
});
