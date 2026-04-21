import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Minus, Volume2 } from 'lucide-react';

export default function MarketPricesScreen() {
  const [marketData, setMarketData] = useState(() => {
    const saved = localStorage.getItem('agrolink-market-prices');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Wheat', price: '2,200', unit: 'per quintal', trend: 'up' },
      { id: 2, name: 'Rice (Paddy)', price: '2,183', unit: 'per quintal', trend: 'up' },
      { id: 3, name: 'Corn', price: '1,962', unit: 'per quintal', trend: 'down' },
      { id: 4, name: 'Soybean', price: '4,600', unit: 'per quintal', trend: 'neutral' },
      { id: 5, name: 'Cotton', price: '6,620', unit: 'per quintal', trend: 'up' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('agrolink-market-prices', JSON.stringify(marketData));
  }, [marketData]);

  const speak = (name, price) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`The current price for ${name} is ${price} rupees per quintal.`);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const renderTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUp size={20} color="green" />;
      case 'down': return <TrendingDown size={20} color="red" />;
      default: return <Minus size={20} color="gray" />;
    }
  };

  return (
    <div className="screen-content" style={{ paddingBottom: '80px' }}>
      <div className="screen-header" style={{ marginLeft: '-20px', marginRight: '-20px' }}>
        <h1>Market Prices</h1>
        <p>Today's local mandi rates</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {marketData.map((item) => (
          <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{item.name}</h3>
                <button 
                  onClick={() => speak(item.name, item.price)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-green)', padding: '0 8px', marginBottom: '4px' }}
                  aria-label="Read aloud"
                >
                  <Volume2 size={16} />
                </button>
              </div>
              <p style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                {item.unit}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>
                <IndianRupee size={18} /> {item.price}
              </div>
              <div>{renderTrendIcon(item.trend)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
