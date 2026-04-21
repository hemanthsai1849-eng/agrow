import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Package, Banknote } from 'lucide-react';
import { OrderAPI } from '../services/api';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await OrderAPI.getOrders();
      setOrders(data.sort((a,b) => b.createdAt - a.createdAt));
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTransport = async (id) => {
    try {
      await OrderAPI.updateOrderStatus(id, 'In Transit');
      alert("Transport Requested! Local logistics partner notified.");
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmPayment = async (id) => {
    try {
      await OrderAPI.updatePayment(id, 'Paid');
      alert("Payment Confirmed! Earnings updated.");
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkDelivered = async (id) => {
    try {
      await OrderAPI.updateOrderStatus(id, 'Delivered');
      // Simulated auto-completed if paid
      const order = orders.find(o => o.id === id);
      if(order.paymentStatus === 'Paid') {
        await OrderAPI.updateOrderStatus(id, 'Completed');
      }
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  if(loading) return <div className="screen-content"><p>Loading orders...</p></div>;

  return (
    <div className="screen-content" style={{ paddingBottom: '80px' }}>
      <div className="screen-header" style={{ marginLeft: '-20px', marginRight: '-20px' }}>
        <h1>Active Orders</h1>
        <p>Logistics and Payments</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {orders.length === 0 && <p style={{textAlign:'center', color:'var(--text-muted)'}}>No orders yet. Accept an offer to create one.</p>}
        
        {orders.map(order => (
          <div key={order.id} className="card" style={{ borderRadius: '24px', borderLeft: order.status === 'Completed' ? '6px solid var(--primary-green)' : '6px solid var(--accent-orange)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Order #{order.id.toString().slice(-4)}</h3>
              <span style={{ 
                backgroundColor: order.status === 'Completed' ? 'var(--light-green)' : '#feebc8', 
                color: order.status === 'Completed' ? 'var(--primary-green)' : '#c05621', 
                padding: '6px 16px', 
                borderRadius: '100px', 
                fontSize: '12px', 
                fontWeight: '600'
              }}>
                {order.status}
              </span>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '16px', marginBottom: '16px' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '15px' }}>
                <Package size={16} /> {order.qty}q {order.cropName} to {order.buyerName}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Amount</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-green)' }}>₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Payment:</span>
              {order.paymentStatus === 'Paid' ? (
                 <span style={{ color: 'var(--primary-green)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={16}/> Paid</span>
              ) : (
                <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '12px' }} onClick={() => handleConfirmPayment(order.id)}>
                   <Banknote size={16}/> Mark as Paid
                </button>
              )}
            </div>

            {/* Logistics Status */}
            {order.status !== 'Completed' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {order.status === 'Pending' && (
                  <button className="btn-primary" style={{ padding: '16px', flex: 1, borderRadius: '100px' }} onClick={() => handleRequestTransport(order.id)}>
                    <Truck size={18} /> Request Transport
                  </button>
                )}
                {order.status === 'In Transit' && (
                  <button className="btn-primary" style={{ padding: '16px', flex: 1, borderRadius: '100px' }} onClick={() => handleMarkDelivered(order.id)}>
                    <CheckCircle2 size={18} /> Mark Delivered
                  </button>
                )}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
