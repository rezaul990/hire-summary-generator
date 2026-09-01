import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDbM5t9BhE5NvXRjITc-try6CVkcLUl0gQ",
  authDomain: "all-project-7f915.firebaseapp.com",
  databaseURL: "https://all-project-7f915-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "all-project-7f915",
  storageBucket: "all-project-7f915.firebasestorage.app",
  messagingSenderId: "192794057278",
  appId: "1:192794057278:web:18235850b8abd309a9cf6f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Format helper to ensure recipients list structure
const normalizeSettings = (data) => {
  if (!data) {
    return { enabled: true, recipients: [] };
  }

  // If data has recipients array
  if (Array.isArray(data.recipients)) {
    return {
      enabled: data.enabled !== undefined ? data.enabled : true,
      recipients: data.recipients
    };
  }

  // Backwards compatibility: single object to recipients array
  if (data.phone && data.area) {
    return {
      enabled: data.enabled !== undefined ? data.enabled : true,
      recipients: [
        {
          id: '1',
          label: 'Recipient 1',
          phone: data.phone,
          area: data.area,
          enabled: data.enabled !== undefined ? data.enabled : true
        }
      ]
    };
  }

  return { enabled: true, recipients: [] };
};

// Save WhatsApp settings (with multiple recipients & areas) to Firebase RTDB
export const saveWhatsAppConfigToFirebase = async (settings) => {
  try {
    const configRef = ref(database, 'whatsapp_settings');
    const payload = {
      enabled: settings.enabled !== undefined ? settings.enabled : true,
      recipients: (settings.recipients || []).map((r, idx) => ({
        id: r.id || String(Date.now() + idx),
        label: r.label || `Recipient ${idx + 1}`,
        phone: (r.phone || '').trim(),
        area: (r.area || '').trim(),
        enabled: r.enabled !== undefined ? r.enabled : true
      })),
      updatedAt: new Date().toISOString()
    };
    await set(configRef, payload);
    return true;
  } catch (error) {
    console.error('Error saving WhatsApp settings to Firebase:', error);
    throw error;
  }
};

// Get WhatsApp settings from Firebase RTDB
export const getWhatsAppConfigFromFirebase = async () => {
  try {
    const configRef = ref(database, 'whatsapp_settings');
    const snapshot = await get(configRef);
    if (snapshot.exists()) {
      return normalizeSettings(snapshot.val());
    }
    return { enabled: true, recipients: [] };
  } catch (error) {
    console.error('Error fetching WhatsApp settings from Firebase:', error);
    return { enabled: true, recipients: [] };
  }
};

// Subscribe to real-time updates
export const subscribeWhatsAppConfig = (callback) => {
  const configRef = ref(database, 'whatsapp_settings');
  return onValue(configRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(normalizeSettings(snapshot.val()));
    } else {
      callback({ enabled: true, recipients: [] });
    }
  }, (error) => {
    console.error('Firebase real-time error:', error);
  });
};
