// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { initializeIcons, ThemeProvider, PartialTheme } from '@fluentui/react';
import { Stack } from '@fluentui/react/lib/Stack';
import ProductCatalog from './components/ProductCatalog';
import Basket from './components/Basket';
import Checkout from './components/Checkout';
import ConfirmPayment from './components/ConfirmPayment';
import Orders from './components/Orders';
import Header from './components/Header';

// Initialize icons
initializeIcons();

// Custom theme (optional)
const myTheme: PartialTheme = {
  palette: {
    themePrimary: '#0078d4',
    themeLighterAlt: '#eff6fc',
    themeLighter: '#deecf9',
    themeLight: '#c7e0f4',
    themeTertiary: '#71afe5',
    themeSecondary: '#2b88d8',
    themeDarkAlt: '#106ebe',
    themeDark: '#005a9e',
    themeDarker: '#004578',
  },
};

const generateRandomUserId = (): number => {
  return Math.floor(Math.random() * 1000000) + 1;
};

const AppContent: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    } else {
      changeUser();
    }
  }, []);

  const changeUser = () => {
    const newUserId = generateRandomUserId();
    localStorage.setItem('userId', newUserId.toString());
    setUserId(newUserId);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  if (userId === null) {
    return <div>Loading...</div>;
  }

  return (
    <Stack>
      <Header userId={userId} onChangeUser={changeUser} />
      <Stack.Item grow styles={{ root: { padding: 20 } }}>
        <Routes>
          <Route path="/" element={<ProductCatalog userId={userId} />} />
          <Route path="/basket" element={<Basket userId={userId} />} />
          <Route path="/checkout" element={<Checkout userId={userId} />} />
          <Route path="/confirm-payment" element={<ConfirmPayment userId={userId} />} />
          <Route path="/orders" element={<Orders  id="orders" />} />
        </Routes>
      </Stack.Item>
    </Stack>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={myTheme}>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export  {App};