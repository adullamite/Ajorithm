import React, { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { ToastProvider } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Index from './pages/Index';
import CreatePact from './pages/CreatePact';
import PactDetail from './pages/PactDetail';
import Profile from './pages/Profile';
import JoinPact from './pages/JoinPact';
import NotFound from './pages/NotFound';

import '@solana/wallet-adapter-react-ui/styles.css';

const App = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ToastProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/create" element={<CreatePact />} />
                <Route path="/pact/:address" element={<PactDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/join/:blink" element={<JoinPact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ToastProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  );
};

export default App;
