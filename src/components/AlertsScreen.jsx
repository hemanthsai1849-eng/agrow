import React, { useState, useEffect } from 'react';
import { AlertTriangle, Droplets, Info, Volume2 } from 'lucide-react';
import { SystemAPI } from '../services/api';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const data = await SystemAPI.getAlerts();
    setAlerts(data);
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
      case 'warning': return <AlertTriangle size={24} color="var(--accent-orange)" />;
      case 'info': return <Droplets size={24} color="#3182ce" />;
      default: return <Info size={24} color="var(--text-muted)" />;
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
      <div className="screen-header" style={{ marginLeft: '-20px', marginRight: '-20px' }}>
        <h1>Alerts & Updates</h1>
        <p>Stay informed</p>
      </div>

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
                    <Volume2 size={20} />
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
    </div>
  );
}
