import React, { useState, useEffect } from 'react';
import { CloudRain, PlusCircle, List, TrendingUp, IndianRupee, Truck, LogOut } from 'lucide-react';
import { SystemAPI, AuthAPI } from '../services/api';

export default function HomeScreen({ setScreen }) {
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const e = await SystemAPI.getEarnings();
      setEarnings(e);
    };
    fetchStats();
  }, [setScreen]);
  const handleLogout = async () => {
    await AuthAPI.logout();
    window.location.reload();
  };

  return (
    <div className="screen-content">
      <div className="screen-header" style={{ marginLeft: '-20px', marginRight: '-20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Welcome Farmer</h1>
          <p>It's a great day to grow!</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--white)', padding: '8px', cursor: 'pointer' }} aria-label="Logout">
          <LogOut size={24} />
        </button>
      </div>

      <div className="card weather-card" style={{ borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Current Weather</h2>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-green)' }}>28°C</p>
            <p style={{ color: 'var(--text-muted)' }}>Partly Cloudy & Humid</p>
          </div>
          <CloudRain size={48} color="var(--primary-green)" />
        </div>
      </div>

      <div className="card" style={{ backgroundColor: 'var(--primary-green)', color: 'white', borderRadius: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '500', opacity: 0.9 }}>Total Market Earnings</h2>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '4px 0', display: 'flex', alignItems: 'center' }}><IndianRupee size={32}/> {earnings.toLocaleString()}</h1>
        <p style={{ fontSize: '14px', opacity: 0.8 }}>From completed orders</p>
      </div>

      <h3 style={{ fontSize: '18px', margin: '24px 0 12px' }}>Quick Actions</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button className="btn-primary" onClick={() => setScreen('crops')} style={{ borderRadius: '100px', padding: '16px' }}>
          <PlusCircle size={20} />
          Add List Crops
        </button>
        <button className="btn-secondary" onClick={() => setScreen('orders')} style={{ borderRadius: '100px', padding: '16px' }}>
          <Truck size={20} />
          Track Logistics
        </button>
        <button className="btn-secondary" onClick={() => setScreen('market')} style={{ borderRadius: '100px', padding: '16px' }}>
          <TrendingUp size={20} />
          Check Market Prices
        </button>
      </div>
    </div>
  );
}
