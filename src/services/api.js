import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  getDoc,
  serverTimestamp,
  orderBy,
  setDoc
} from 'firebase/firestore';

// Simulate network delay minimally if needed, but Firestore is async by default
const DELAY = 100;
const simulateNetwork = (data) => new Promise(resolve => setTimeout(() => resolve(data), DELAY));

export const AuthAPI = {
  login: async (phone, otp, name) => {
    // Keep auth mocked in local storage for simplicity so testers don't need real SMS
    if (otp === '1234') { 
      const user = { phone, verified: true, name: name };
      localStorage.setItem('agrolink-user', JSON.stringify(user));
      
      // Log the user into Firestore to track logins
      const userRef = doc(db, 'users', phone);
      await setDoc(userRef, { 
        phone: phone,
        name: name,
        lastLogin: Date.now(), 
        role: 'farmer' 
      }, { merge: true });

      return simulateNetwork({ success: true, user });
    }
    throw new Error('Invalid OTP. Try 1234');
  },
  getUser: async () => simulateNetwork(JSON.parse(localStorage.getItem('agrolink-user'))),
  updateUserName: async (phone, name) => {
    const user = JSON.parse(localStorage.getItem('agrolink-user'));
    if (user && user.phone === phone) {
      user.name = name;
      localStorage.setItem('agrolink-user', JSON.stringify(user));
      
      // Update in Firestore as well
      const userRef = doc(db, 'users', phone);
      await setDoc(userRef, { 
        name: name,
        updatedAt: Date.now()
      }, { merge: true });

      return simulateNetwork({ success: true, user });
    }
    throw new Error('User not authenticated');
  },
  logout: async () => {
    localStorage.removeItem('agrolink-user');
    return simulateNetwork({ success: true });
  }
};

export const CropAPI = {
  getCrops: async () => {
    const user = JSON.parse(localStorage.getItem('agrolink-user'));
    if (!user) return [];
    
    const q = query(collection(db, 'crops'), where('userPhone', '==', user.phone));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  addCrop: async (cropData) => {
    const user = JSON.parse(localStorage.getItem('agrolink-user'));
    if (!user) throw new Error('User not authenticated');
    
    const newCrop = {
      ...cropData,
      userPhone: user.phone,
      status: 'Planted',
      availableQty: Number(cropData.totalQty),
      isListedForSale: false,
      createdAt: Date.now()
    };
    const docRef = await addDoc(collection(db, 'crops'), newCrop);
    return { id: docRef.id, ...newCrop };
  },
  updateCropStatus: async (cropId, status) => {
    const cropRef = doc(db, 'crops', cropId);
    await updateDoc(cropRef, { status });
    return { id: cropId, status };
  }
};

export const OfferAPI = {
  getOffers: async () => {
    const user = JSON.parse(localStorage.getItem('agrolink-user'));
    if (!user) return [];
    
    const q = query(collection(db, 'offers'), where('userPhone', '==', user.phone));
    const querySnapshot = await getDocs(q);
    const offers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Auto-expire
    const now = Date.now();
    for (const o of offers) {
      if (o.status === 'pending' && o.expiresAt < now) {
        await updateDoc(doc(db, 'offers', o.id), { status: 'expired' });
        o.status = 'expired';
      }
    }
    return offers;
  },
  
  listCropForSale: async (cropId, qty, price) => {
    const user = JSON.parse(localStorage.getItem('agrolink-user'));
    if (!user) throw new Error('User not authenticated');
    
    const cropRef = doc(db, 'crops', cropId);
    await updateDoc(cropRef, {
      isListedForSale: true,
      sellQty: Number(qty),
      pricePerQuintal: Number(price)
    });
    
    // Generate a mock offer automatically from "Buyers"
    const cropSnap = await getDoc(cropRef);
    const cropData = cropSnap.exists() ? cropSnap.data() : { name: 'Crop' };

    const fakeBuyers = ['Kisan Mart Local', 'ABC Agro Traders', 'Regional Food Processors', 'City Mandi Agents'];
    const randomBuyer = fakeBuyers[Math.floor(Math.random() * fakeBuyers.length)];
    
    await addDoc(collection(db, 'offers'), {
      cropId: cropId,
      userPhone: user.phone,
      buyerName: randomBuyer,
      buyerPhone: '9876543210',
      qty: Number(qty),
      price: Number(price), // Matches expected price
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000
    });

    await addDoc(collection(db, 'alerts'), {
      userPhone: user.phone,
      type: 'info',
      title: 'New Offer Received!',
      message: `${randomBuyer} sent an offer for your ${cropData.name}.`,
      time: 'Just now',
      createdAt: Date.now()
    });
    
    return true;
  },

  acceptOffer: async (offerId) => {
    const user = JSON.parse(localStorage.getItem('agrolink-user'));
    if (!user) throw new Error('User not authenticated');
    
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);
    if (!offerSnap.exists()) throw new Error("Offer not found");
    const offer = offerSnap.data();

    if (offer.status !== 'pending') throw new Error('Action not allowed');

    const cropRef = doc(db, 'crops', offer.cropId);
    const cropSnap = await getDoc(cropRef);
    if (!cropSnap.exists()) throw new Error("Crop not found");
    const crop = cropSnap.data();

    if (crop.availableQty < offer.qty) {
      throw new Error('Not enough quantity available to accept this offer.');
    }

    await updateDoc(offerRef, { status: 'accepted' });
    await updateDoc(cropRef, { availableQty: crop.availableQty - offer.qty });

    const newOrder = {
      offerId: offerId,
      userPhone: user.phone,
      buyerName: offer.buyerName,
      buyerPhone: offer.buyerPhone,
      cropName: crop.name,
      qty: offer.qty,
      price: offer.price,
      totalAmount: offer.qty * offer.price,
      status: 'Pending',
      paymentStatus: 'Pending',
      createdAt: Date.now()
    };
    const orderDoc = await addDoc(collection(db, 'orders'), newOrder);

    await addDoc(collection(db, 'alerts'), {
      userPhone: user.phone,
      type: 'info', 
      title: 'Offer Accepted', 
      message: `You accepted an offer for ${offer.qty}q of ${crop.name}. Tracker created in Orders!`, 
      time: 'Just now',
      createdAt: Date.now()
    });

    return { id: orderDoc.id, ...newOrder };
  },

  rejectOffer: async (offerId) => {
    await updateDoc(doc(db, 'offers', offerId), { status: 'rejected' });
    return true;
  },

  counterOffer: async (offerId, newPrice) => {
    await updateDoc(doc(db, 'offers', offerId), { price: newPrice, status: 'pending' });
    return true;
  }
};

export const OrderAPI = {
  getOrders: async () => {
    const user = JSON.parse(localStorage.getItem('agrolink-user'));
    if (!user) return [];
    
    const q = query(collection(db, 'orders'), where('userPhone', '==', user.phone));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  updateOrderStatus: async (orderId, newStatus) => {
    const user = JSON.parse(localStorage.getItem('agrolink-user'));
    if (!user) throw new Error('User not authenticated');
    
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if(orderSnap.exists()) {
       const order = orderSnap.data();
       const updates = { status: newStatus };
       if(newStatus === 'Completed' && order.paymentStatus !== 'Paid') {
         updates.paymentStatus = 'Paid';
       }
       await updateDoc(orderRef, updates);
       
       await addDoc(collection(db, 'alerts'), {
          userPhone: user.phone,
          type: 'info', 
          title: 'Order Update', 
          message: `Order for ${order.cropName} is now ${newStatus}.`, 
          time: 'Just now', 
          createdAt: Date.now()
       });
       return true;
    }
    return false;
  },
  updatePayment: async (orderId, paymentStatus) => {
    const user = JSON.parse(localStorage.getItem('agrolink-user'));
    if (!user) throw new Error('User not authenticated');
    
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if(orderSnap.exists()) {
       const order = orderSnap.data();
       const updates = { paymentStatus };
       if(paymentStatus === 'Paid' && order.status === 'Delivered') {
          updates.status = 'Completed';
       }
       await updateDoc(orderRef, updates);
       return true;
    }
    return false;
  }
};

export const SystemAPI = {
  getAlerts: async () => {
    const user = JSON.parse(localStorage.getItem('agrolink-user'));
    if (!user) return [];
    
    const q = query(collection(db, 'alerts'), where('userPhone', '==', user.phone));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt);
  },
  getEarnings: async () => {
    const user = JSON.parse(localStorage.getItem('agrolink-user'));
    if (!user) return 0;
    
    const q = query(collection(db, 'orders'), where('userPhone', '==', user.phone));
    const snap = await getDocs(q);
    let total = 0;
    snap.forEach(doc => {
      const data = doc.data();
      if(data.status === 'Completed' || data.paymentStatus === 'Paid') {
         total += data.totalAmount;
      }
    });
    return total;
  }
};
