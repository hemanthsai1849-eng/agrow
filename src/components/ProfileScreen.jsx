import React, { useState, useEffect } from 'react';
import { User, Phone, CheckCircle, AlertTriangle, Info, LogOut, Volume2 } from 'lucide-react';
import { AuthAPI, SystemAPI } from '../services/api';

export default function ProfileScreen({ setScreen }) {
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchUserAndAlerts();
  }, []);

  const fetchUserAndAlerts = async () => {
    const userData = await AuthAPI.getUser();
    const alertsData = await SystemAPI.getAlerts();
    setUser(userData);
    setAlerts(alertsData);
  };

  const handleLogout = async () => {
    await AuthAPI.logout();
    window.location.reload();
  };

  const speak = (title, message) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${title}. ${message}`);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'warning': return <AlertTriangle size={20} color="var(--accent-orange)" />;
      case 'info': return <Info size={20} color="#3182ce" />;
      default: return <Info size={20} color="var(--text-muted)" />;
    }
  };

  const getBorderColor = (type) => {
    switch(type) {
      case 'warning': return 'var(--accent-orange)';
      case 'info': return '#3182ce';
      default: return 'var(--border-color)';
    }
  };

  return (
    <div className="screen-content" style={{ paddingBottom: '80px' }}>
      <div className="screen-header" style={{ marginLeft: '-20px', marginRight: '-20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Profile</h1>
          <p>Account Information</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--white)', padding: '8px', cursor: 'pointer' }} aria-label="Logout">
          <LogOut size={24} />
        </button>
      </div>

      {/* Profile Card */}
      {user && (
        <div className="card" style={{ backgroundColor: '#f0fdf4', borderRadius: '24px', border: '2px solid var(--primary-green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary-green)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <User size={32} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-green)', marginBottom: '4px' }}>
                {user.name || 'Farmer'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <Phone size={16} />
                <span>{user.phone}</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '8px 12px', borderRadius: '12px', width: 'fit-content' }}>
            <CheckCircle size={18} color="var(--primary-green)" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary-green)' }}>Verified Farmer</span>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      <h3 style={{ fontSize: '18px', marginBottom: '12px', marginTop: '24px' }}>Recent Updates</h3>
      
      {alerts.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No alerts yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alerts.map(alert => (
            <div key={alert.id} className="card" style={{ borderLeft: `4px solid ${getBorderColor(alert.type)}`, borderRadius: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ paddingTop: '2px' }}>
                  {getAlertIcon(alert.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{alert.title}</h3>
                    <button 
                      onClick={() => speak(alert.title, alert.message)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-green)', padding: '4px' }}
                      aria-label="Read aloud"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.4', marginBottom: '8px' }}>
                    {alert.message}
                  </p>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{alert.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
