import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, Sprout, CheckCircle2, Store } from 'lucide-react';
import { CropAPI, OfferAPI } from '../services/api';

export default function CropManagementScreen({ setScreen }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const data = await CropAPI.getCrops();
      setCrops(data);
    } catch(error) {
      alert("Error loading crops from Firebase: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const [newCrop, setNewCrop] = useState({ name: '', date: '', notes: '', totalQty: '' });

  const handleAddCrop = async (e) => {
    e.preventDefault();
    if (newCrop.name && newCrop.date && newCrop.totalQty) {
      const added = await CropAPI.addCrop(newCrop);
      setCrops([...crops, added]);
      setNewCrop({ name: '', date: '', notes: '', totalQty: '' });
      setShowAddForm(false);
    }
  };

  const handleSellClick = async (id, name) => {
    const qty = window.prompt(`How many Quintals of ${name} do you want to sell?`);
    if (!qty) return;
    const price = window.prompt(`What is your expected price per quintal for ${name}?`);
    if (!price) return;
    
    // Call the unified Backend API Simulator
    await OfferAPI.listCropForSale(id, qty, price);
    
    alert(`Success! Your ${name} is now listed for sale. We've routed you to your Buyers inbox!`);
    
    if (setScreen) {
       setScreen('buyers');
    }
  };

  return (
    <div className="screen-content" style={{ paddingBottom: '80px' }}>
      <div className="screen-header" style={{ marginLeft: '-20px', marginRight: '-20px' }}>
        <h1>My Crops</h1>
        <p>Manage your field</p>
      </div>

      {!showAddForm ? (
        <>
          <button className="btn-primary" onClick={() => setShowAddForm(true)} style={{ marginBottom: '24px' }}>
            <PlusCircle size={20} />
            Add New Crop
          </button>
          
          <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Current Crops</h3>
          {crops.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No crops added yet.</p>
          ) : (
            crops.map(crop => (
              <div key={crop.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '18px', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sprout size={18} /> {crop.name}
                  </h4>
                  <span style={{ 
                    backgroundColor: 'var(--light-green)', 
                    color: 'var(--primary-green)', 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: '600' 
                  }}>
                    {crop.status}
                  </span>
                </div>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <Calendar size={14} /> Planted: {crop.date}
                </p>
                {crop.notes && <p style={{ fontSize: '14px', marginTop: '4px' }}>📝 {crop.notes}</p>}
                
                <div style={{ marginTop: '8px' }}>
                  {crop.isListedForSale ? (
                    <div style={{ backgroundColor: '#ebf8ff', color: '#3182ce', padding: '8px', borderRadius: '100px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '500' }}>
                      <Store size={16} /> Listed Market Qty: {crop.sellQty || crop.totalQty}q
                    </div>
                  ) : (
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleSellClick(crop.id, crop.name)}
                      style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '100px' }}
                    >
                      <Store size={16} /> List for Sale
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Add Crop Details</h3>
          <form onSubmit={handleAddCrop} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Crop Name</label>
              <input 
                type="text" 
                value={newCrop.name}
                onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                placeholder="e.g. Rice, Tomato"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '16px' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Planting Date</label>
              <input 
                type="date" 
                value={newCrop.date}
                onChange={(e) => setNewCrop({...newCrop, date: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '16px' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Total Quantity (Quintals)</label>
              <input 
                type="number" 
                value={newCrop.totalQty}
                onChange={(e) => setNewCrop({...newCrop, totalQty: e.target.value})}
                placeholder="e.g. 100"
                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', fontSize: '16px' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Notes (Optional)</label>
              <textarea 
                value={newCrop.notes}
                onChange={(e) => setNewCrop({...newCrop, notes: e.target.value})}
                placeholder="Any special care instructions..."
                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', fontSize: '16px', minHeight: '80px', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">
                <CheckCircle2 size={18} /> Save Crop
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
