import React, { useState } from 'react';
import { ShieldCheck, Phone } from 'lucide-react';
import { AuthAPI } from '../services/api';

export default function AuthScreen({ onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // phone, otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if(phone.length < 10) {
       setError('Please enter a valid 10-digit phone number.');
       return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await AuthAPI.login(phone, otp);
      if(res.success) {
        onLoginSuccess();
      }
    } catch(err) {
      setError(err.message || 'Verification Failed. Try OTP: 1234');
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: 'var(--primary-green)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      <div style={{ backgroundColor: 'var(--white)', padding: '32px 24px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'var(--light-green)', padding: '16px', borderRadius: '50%' }}>
            <ShieldCheck size={48} color="var(--primary-green)" />
          </div>
        </div>
        
        <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '8px', color: 'var(--text-main)' }}>AgroLink</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
          {step === 'phone' ? 'Enter verifying phone number' : 'Enter the OTP sent to your phone'}
        </p>

        {error && <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Phone size={20} color="var(--text-muted)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '100px', border: '1px solid var(--border-color)', fontSize: '16px', outline: 'none' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ borderRadius: '100px' }} disabled={loading}>
              {loading ? 'Sending...' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <input 
                type="text" 
                placeholder="Enter 1234 to simulate" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '100px', border: '1px solid var(--border-color)', fontSize: '18px', textAlign: 'center', letterSpacing: '4px', outline: 'none' }}
              />
              <button type="submit" className="btn-primary" style={{ borderRadius: '100px' }} disabled={loading}>
                 {loading ? 'Verifying...' : 'Verify Securely'}
              </button>
          </form>
        )}

      </div>
    
    </div>
  );
}
