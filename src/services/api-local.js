// Simulated Backend API for AgroLink

const DELAY = 300; // Simulated network delay in ms

// Utility to get/set Database from localStorage
const getDB = () => {
  const db = localStorage.getItem('agrolink-db');
  if (db) return JSON.parse(db);
  
  // Seed Database First Time
  const initialDB = {
    user: null, // { phone, verified, name }
    crops: [
      { id: 1, name: 'Wheat', date: '2025-11-20', status: 'Harvested', availableQty: 100, totalQty: 100, pricePerQuintal: 2200 },
      { id: 2, name: 'Corn', date: '2026-03-05', status: 'Growing', availableQty: 200, totalQty: 200, pricePerQuintal: 1950 }
    ],
    offers: [
      { id: 101, cropId: 1, buyerName: 'ABC Agro Traders', buyerPhone: '9876543210', qty: 50, price: 2250, status: 'pending', createdAt: Date.now(), expiresAt: Date.now() + 86400000 }
    ],
    orders: [],
    alerts: [
      { id: 1, type: 'info', title: 'Welcome to AgroLink', message: 'You can now securely sell your crops to verified buyers.', time: 'Just now' }
    ],
    earnings: 0
  };
  localStorage.setItem('agrolink-db', JSON.stringify(initialDB));
  return initialDB;
};

const saveDB = (db) => {
  localStorage.setItem('agrolink-db', JSON.stringify(db));
};

const simulateNetwork = (data) => new Promise(resolve => setTimeout(() => resolve(data), DELAY));

export const AuthAPI = {
  login: async (phone, otp) => {
    const db = getDB();
    if (otp === '1234') { // Mock verification
      db.user = { phone, verified: true, name: 'Farmer User' };
      saveDB(db);
      return simulateNetwork({ success: true, user: db.user });
    }
    throw new Error('Invalid OTP');
  },
  getUser: async () => simulateNetwork(getDB().user),
  logout: async () => {
    const db = getDB();
    db.user = null;
    saveDB(db);
    return simulateNetwork({ success: true });
  }
};

export const CropAPI = {
  getCrops: async () => simulateNetwork(getDB().crops),
  addCrop: async (cropData) => {
    const db = getDB();
    const newCrop = {
      ...cropData,
      id: Date.now(),
      status: 'Planted',
      availableQty: Number(cropData.totalQty),
    };
    db.crops.push(newCrop);
    saveDB(db);
    return simulateNetwork(newCrop);
  },
  updateCropStatus: async (cropId, status) => {
    const db = getDB();
    const crop = db.crops.find(c => c.id === cropId);
    if(crop) crop.status = status;
    saveDB(db);
    return simulateNetwork(crop);
  },
  listCropForSale: async (cropId, qty, price) => {
    const db = getDB();
    const crop = db.crops.find(c => c.id === cropId);
    if(crop) {
       crop.isListedForSale = true;
       crop.sellQty = Number(qty);
       crop.pricePerQuintal = Number(price);
       
       // Automatically generate a simulated random offer for the listed crop!
       const fakeBuyers = ['Kisan Mart Local', 'ABC Agro Traders', 'Regional Food Processors', 'City Mandi Agents'];
       const randomBuyer = fakeBuyers[Math.floor(Math.random() * fakeBuyers.length)];
       const newOffer = {
         id: Date.now(),
         cropId: crop.id,
         buyerName: randomBuyer,
         buyerPhone: '9876543210',
         qty: qty, 
         price: price, // Buyer initially accepts expected price for MVP simplicity
         status: 'pending',
         createdAt: Date.now(),
         expiresAt: Date.now() + 86400000
       };
       db.offers.push(newOffer);
       db.alerts.unshift({
          id: Date.now() + 1, type: 'info', title: 'New Offer Received!', message: `${randomBuyer} sent an offer for your ${crop.name}.`, time: 'Just now'
       });
    }
    saveDB(db);
    return simulateNetwork(crop);
  }
};

export const OfferAPI = {
  getOffers: async () => {
    const db = getDB();
    // Auto-expire old offers
    const now = Date.now();
    let changed = false;
    db.offers.forEach(o => {
      if(o.status === 'pending' && o.expiresAt < now) {
        o.status = 'expired';
        changed = true;
      }
    });
    if(changed) saveDB(db);
    return simulateNetwork(db.offers);
  },
  acceptOffer: async (offerId) => {
    const db = getDB();
    const offer = db.offers.find(o => o.id === offerId);
    if (!offer || offer.status !== 'pending') throw new Error('Action not allowed');
    
    const crop = db.crops.find(c => c.id === offer.cropId);
    if (!crop || crop.availableQty < offer.qty) {
      throw new Error('Not enough quantity available to accept this offer.');
    }

    // Process Transaction
    offer.status = 'accepted';
    crop.availableQty -= offer.qty;

    // Create Order
    const newOrder = {
      id: Date.now(),
      offerId: offer.id,
      buyerName: offer.buyerName,
      buyerPhone: offer.buyerPhone,
      cropName: crop.name,
      qty: offer.qty,
      price: offer.price,
      totalAmount: offer.qty * offer.price,
      status: 'Pending', // Pending, Confirmed, In Transit, Delivered, Completed
      paymentStatus: 'Pending',
      createdAt: Date.now()
    };
    db.orders.push(newOrder);

    // Notify User
    db.alerts.unshift({
      id: Date.now() + 1, type: 'info', title: 'Offer Accepted', message: `You accepted an offer for ${offer.qty}q of ${crop.name}. Order created!`, time: 'Just now'
    });

    saveDB(db);
    return simulateNetwork(newOrder);
  },
  rejectOffer: async (offerId) => {
    const db = getDB();
    const offer = db.offers.find(o => o.id === offerId);
    if(offer) offer.status = 'rejected';
    saveDB(db);
    return simulateNetwork({ success: true });
  },
  counterOffer: async (offerId, newPrice) => {
    const db = getDB();
    const offer = db.offers.find(o => o.id === offerId);
    if(offer) {
       offer.price = newPrice;
       offer.status = 'pending'; // Reset state for buyer to review
       // In a real app we'd dispatch to buyer. Here we just update it.
    }
    saveDB(db);
    return simulateNetwork(offer);
  }
};

export const OrderAPI = {
  getOrders: async () => simulateNetwork(getDB().orders),
  updateOrderStatus: async (orderId, newStatus) => {
    const db = getDB();
    const order = db.orders.find(o => o.id === orderId);
    if(order) {
       order.status = newStatus;
       if(newStatus === 'Completed' && order.paymentStatus !== 'Paid') {
         order.paymentStatus = 'Paid';
         db.earnings += order.totalAmount;
       }
       db.alerts.unshift({
          id: Date.now(), type: 'info', title: 'Order Update', message: `Order #${orderId} is now ${newStatus}.`, time: 'Just now'
       });
    }
    saveDB(db);
    return simulateNetwork(order);
  },
  updatePayment: async (orderId, paymentStatus) => {
    const db = getDB();
    const order = db.orders.find(o => o.id === orderId);
    if(order) {
       order.paymentStatus = paymentStatus;
       if(paymentStatus === 'Paid' && order.status === 'Delivered') {
          order.status = 'Completed';
          db.earnings += order.totalAmount;
       }
    }
    saveDB(db);
    return simulateNetwork(order);
  }
};

export const SystemAPI = {
  getAlerts: async () => simulateNetwork(getDB().alerts),
  getEarnings: async () => simulateNetwork(getDB().earnings)
};
