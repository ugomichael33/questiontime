import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";

import { requestToken } from "../../src/services/authService";
import TokenRequest from "../../src/pages/token-request";

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../src/services/authService', () => ({
  requestToken: jest.fn(),
}));

const localStorageMock = (function() {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('TokenRequest', () => {
  const mockedUseRouter = useRouter as jest.Mock;
  const mockPush = jest.fn();
  
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      push: mockPush,
    });
    (requestToken as jest.Mock).mockReset();
    localStorageMock.clear();
    mockPush.mockReset();
  });

  it('submits and stores token when a valid email is entered', async () => {
    const token = 'test-token';
    (requestToken as jest.Mock).mockResolvedValue(token);
    
    render(<TokenRequest />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Request Token'));

    await waitFor(() => {
      expect(requestToken).toHaveBeenCalledWith('test@example.com');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('qt_token', token);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows an error message on token retrieval failure', async () => {
    (requestToken as jest.Mock).mockResolvedValue(null);
    
    render(<TokenRequest />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Request Token'));

    await waitFor(() => {
      expect(requestToken).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText('Failed to retrieve token. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows a validation error for invalid email', async () => {
    render(<TokenRequest />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'invalid' } });
    
    fireEvent.click(screen.getByText('Request Token'));

    await waitFor(() => {
      expect(screen.getByText('Please enter your email to receive your token')).toBeInTheDocument();
    });
  });
});
