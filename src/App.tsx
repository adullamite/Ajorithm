import React, { useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import ErrorBoundary from "./components/ErrorBoundary";
import Landing from "./pages/Landing";
import CreatePact from "./pages/CreatePact";
import PactDetail from "./pages/PactDetail";
import Profile from "./pages/Profile";
import JoinPact from "./pages/JoinPact";
import NotFound from "./pages/NotFound";
import "@solana/wallet-adapter-react-ui/styles.css";

const App = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/create" element={<CreatePact />} />
              <Route path="/pact/:address" element={<PactDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/join/:address" element={<JoinPact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  );
};

export default App;
