import React from 'react'; // Refreshed routes
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StarBackground from './components/StarBackground';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import RobuxCatalog from './pages/RobuxCatalog';
import Checkout from './pages/Checkout';
import Reviews from './pages/Reviews';
import GameItems from './pages/GameItems';
import Groups from './pages/Groups';
import Account from './pages/Account';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import Fortnite from './pages/Fortnite';

import PageLoader from './components/PageLoader';

function AppContent() {
  const location = useLocation();
  const isIngame = location.pathname.startsWith('/catalog/ingame');
  const isCheckout = location.pathname === '/checkout';
  const isChat = location.pathname === '/chat';
  const isNoUI = isIngame || isCheckout || isChat;

  return (
    <div className={`font-sans selection:bg-blue-500/30 flex flex-col bg-pixel-bg ${isNoUI ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <PageLoader />
      <StarBackground />
      {!isNoUI && <Navbar />}

      <main className={isIngame || isCheckout ? 'flex-1 flex flex-col' : 'flex-grow'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/robux" element={<RobuxCatalog />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/account" element={<Account />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/catalog/ingame/:gameId" element={<GameItems />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/fortnite" element={<Fortnite />} />
        </Routes>
      </main>

      {!isNoUI && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
