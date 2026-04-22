import React from 'react';
import { Home, Sprout, TrendingUp, Bell, Store, User } from 'lucide-react';
import './Navigation.css';

export default function Navigation({ currentScreen, setCurrentScreen }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'crops', label: 'My Crops', icon: Sprout },
    { id: 'market', label: 'Prices', icon: TrendingUp },
    { id: 'buyers', label: 'Buyers', icon: Store },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setCurrentScreen(item.id)}
          >
            <Icon size={24} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
