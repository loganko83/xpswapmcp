import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SwapInterface from '../client/src/components/SwapInterface';
import WalletConnect from '../client/src/components/WalletConnect';

// Mock fetch for API calls
global.fetch = vi.fn();

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('SwapInterface Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should render swap interface correctly', () => {
    render(
      <Wrapper>
        <SwapInterface />
      </Wrapper>
    );

    expect(screen.getByText(/Simple Swap/i)).toBeInTheDocument();
    expect(screen.getByText(/From/i)).toBeInTheDocument();
    expect(screen.getByText(/To/i)).toBeInTheDocument();
  });

  it('should show token selection dropdowns', () => {
    render(
      <Wrapper>
        <SwapInterface />
      </Wrapper>
    );

    const tokenSelectors = screen.getAllByRole('button');
    expect(tokenSelectors.length).toBeGreaterThan(0);
  });

  it('should handle amount input', async () => {
    render(
      <Wrapper>
        <SwapInterface />
      </Wrapper>
    );

    const amountInput = screen.getByPlaceholderText(/Enter amount/i);
    fireEvent.change(amountInput, { target: { value: '100' } });
    
    expect(amountInput.value).toBe('100');
  });

  it('should fetch swap quote when amount is entered', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        quote: {
          inputToken: 'XP',
          outputToken: 'USDT',
          inputAmount: '100',
          outputAmount: '1.4594',
          rate: 0.014594
        }
      }),
    });

    render(
      <Wrapper>
        <SwapInterface />
      </Wrapper>
    );

    const amountInput = screen.getByPlaceholderText(/Enter amount/i);
    fireEvent.change(amountInput, { target: { value: '100' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/swap-quote'),
        expect.any(Object)
      );
    });
  });
});

describe('WalletConnect Component', () => {
  it('should render wallet connection button', () => {
    render(
      <Wrapper>
        <WalletConnect />
      </Wrapper>
    );

    expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
  });

  it('should show wallet options when clicked', async () => {
    render(
      <Wrapper>
        <WalletConnect />
      </Wrapper>
    );

    const connectButton = screen.getByText(/Connect Wallet/i);
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText(/MetaMask/i)).toBeInTheDocument();
      expect(screen.getByText(/ZIGAP/i)).toBeInTheDocument();
    });
  });

  it('should handle wallet connection error', async () => {
    // Mock wallet connection failure
    Object.defineProperty(window, 'ethereum', {
      value: undefined,
      writable: true
    });

    render(
      <Wrapper>
        <WalletConnect />
      </Wrapper>
    );

    const connectButton = screen.getByText(/Connect Wallet/i);
    fireEvent.click(connectButton);

    const metamaskOption = await screen.findByText(/MetaMask/i);
    fireEvent.click(metamaskOption);

    await waitFor(() => {
      expect(screen.getByText(/MetaMask not detected/i)).toBeInTheDocument();
    });
  });
});
