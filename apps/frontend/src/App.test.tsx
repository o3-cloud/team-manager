import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

describe('App', () => {
  it('redirects to login when unauthenticated', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });
});
