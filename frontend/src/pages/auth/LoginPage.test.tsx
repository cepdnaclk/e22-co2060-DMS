import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { useToast } from '../../components/common/Toast';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../api', () => ({
  authAPI: {
    login: vi.fn(),
  },
}));

vi.mock('../../components/common/Toast', () => ({
  useToast: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      login: vi.fn(),
      selectedRole: 'DEBATER',
    });
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      showToast: vi.fn(),
    });
  });

  it('shows an error toast when login fails', async () => {
    const showToast = vi.fn();
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ showToast });
    (authAPI.login as unknown as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('username or email@example.com'), {
      target: { value: 'debater1' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Invalid credentials', 'error');
    });
  });
});
