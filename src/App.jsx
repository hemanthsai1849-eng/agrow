import React, { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import CropManagementScreen from './components/CropManagementScreen';
import MarketPricesScreen from './components/MarketPricesScreen';
import BuyersScreen from './components/BuyersScreen';
import OrdersScreen from './components/OrdersScreen';
import ProfileScreen from './components/ProfileScreen';
import Navigation from './components/Navigation';
import AuthScreen from './components/AuthScreen';
import useOnlineStatus from './useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { AuthAPI } from './services/api';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const usr = await AuthAPI.getUser();
    setUser(usr);
    setIsAuthChecking(false);
  };

  const renderScreen = () => {
    switch(currentScreen) {
      case 'home':
        return <HomeScreen setScreen={setCurrentScreen} />;
      case 'crops':
        return <CropManagementScreen setScreen={setCurrentScreen} />;
      case 'market':
        return <MarketPricesScreen />;
      case 'orders':
        return <OrdersScreen />;
      case 'buyers':
        return <BuyersScreen />;
      case 'profile':
        return <ProfileScreen setScreen={setCurrentScreen} />;
      default:
        return <HomeScreen setScreen={setCurrentScreen} />;
    }
  };

  if (isAuthChecking) return <div style={{ height: '100vh', backgroundColor: 'var(--primary-green)' }} />;

  if (!user) {
    return <AuthScreen onLoginSuccess={checkAuth} />;
  }

  return (
    <>
      {!isOnline && (
        <div style={{ backgroundColor: 'var(--accent-orange)', color: 'white', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', zIndex: 1000, position: 'relative' }}>
          <WifiOff size={16} /> You are currently offline. Showing saved data.
        </div>
      )}
      {renderScreen()}
      <Navigation currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </>
  );
}

export default App;
