import React, { useState, useEffect } from 'react';
import { Store, Phone, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react';
import { OfferAPI, CropAPI } from '../services/api';

export default function BuyersScreen() {
  const [offers, setOffers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [_offers, _crops] = await Promise.all([OfferAPI.getOffers(), CropAPI.getCrops()]);
      setOffers(_offers.sort((a,b) => b.createdAt - a.createdAt));
      setCrops(_crops);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await OfferAPI.acceptOffer(id);
      alert("Offer Accepted! An Order has been created. Tracking it in the Orders tab.");
      fetchData();
    } catch(error) {
      alert("Error: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await OfferAPI.rejectOffer(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCounter = async (id, currentPrice) => {
    const newPrice = window.prompt(`Counter Offer: Enter your new expected price (Current: ₹${currentPrice})`);
    if(newPrice && !isNaN(newPrice)) {
      try {
        await OfferAPI.counterOffer(id, Number(newPrice));
        alert("Counter offer sent!");
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCall = (buyerName) => {
    alert(`Starting call to ${buyerName}...`);
  };

  const getCropName = (cropId) => {
    const crop = crops.find(c => c.id === cropId);
    return crop ? crop.name : 'Unknown Crop';
  };

  if(loading) return <div className="screen-content"><p>Loading offers...</p></div>;

  return (
    <div className="screen-content" style={{ paddingBottom: '80px' }}>
      <div className="screen-header" style={{ marginLeft: '-20px', marginRight: '-20px' }}>
        <h1>Buyer Offers</h1>
        <p>Local businesses looking to buy</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {offers.length === 0 && <p style={{textAlign:'center', color:'var(--text-muted)'}}>No active offers yet.</p>}
        {offers.map(offer => (
          <div key={offer.id} className="card" style={{ borderTop: offer.status === 'accepted' ? '4px solid var(--primary-green)' : offer.status === 'rejected' ? '4px solid red' : '4px solid #3182ce', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Store size={18} color="var(--primary-green)" /> {offer.buyerName}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Clock size={12} /> {new Date(offer.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span style={{ 
                backgroundColor: offer.status === 'accepted' ? 'var(--light-green)' : '#ebf8ff', 
                color: offer.status === 'accepted' ? 'var(--primary-green)' : '#3182ce', 
                padding: '6px 12px', 
                borderRadius: '100px', 
                fontSize: '12px', 
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {offer.status}
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Wants to buy:</span> <strong>{offer.qty}q</strong> of <strong>{getCropName(offer.cropId)}</strong>
              </p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                Offer: <span style={{ color: 'var(--primary-green)' }}>₹{offer.price} / q</span>
              </p>
            </div>

            {offer.status === 'pending' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '16px', flex: 1, borderRadius: '100px', backgroundColor: '#e53e3e' }}
                    onClick={() => handleReject(offer.id)}
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '16px', flex: 1, borderRadius: '100px' }}
                    onClick={() => handleAccept(offer.id)}
                  >
                    <CheckCircle size={18} /> Accept
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '16px', flex: 1, borderRadius: '100px' }}
                    onClick={() => handleCounter(offer.id, offer.price)}
                  >
                    <RefreshCw size={18} /> Counter Offer
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '16px', flex: 1, borderRadius: '100px' }}
                    onClick={() => handleCall(offer.buyerName)}
                  >
                    <Phone size={18} /> Call
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
