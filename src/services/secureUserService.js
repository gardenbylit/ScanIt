import Realm from 'realm';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';

// User and Subscription Schema for Realm
const UserSchema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: 'string',
    email: 'string',
    deviceId: 'string',
    subscriptionTier: 'string',
    startDate: 'date',
    purchaseDate: 'date?',
    receiptToken: 'string?',
    scansThisMonth: 'int',
    lastResetDate: 'date',
    isActive: 'bool',
    createdAt: 'date',
    updatedAt: 'date',
  },
};

const VIPContactSchema = {
  name: 'VIPContact',
  primaryKey: 'id',
  properties: {
    id: 'string',
    userId: 'string', // Foreign key to User
    firstName: 'string',
    lastName: 'string',
    title: 'string?',
    company: 'string?',
    email: 'string?',
    phone: 'string?',
    notes: 'string?',
    vipBadge: 'bool',
    isBookmarked: 'bool',
    createdAt: 'date',
    updatedAt: 'date',
  },
};

let realm = null;

export const initializeSecureDatabase = async () => {
  try {
    realm = await Realm.open({
      schema: [UserSchema, VIPContactSchema],
      schemaVersion: 2,
    });
    console.log('Secure database initialized successfully');
  } catch (error) {
    console.error('Secure database initialization error:', error);
    throw error;
  }
};

/**
 * Create or initialize user with secure storage
 */
export const initializeUser = async (email) => {
  try {
    const userId = uuidv4();
    const deviceId = uuidv4();

    // Store sensitive data in secure storage
    await SecureStore.setItemAsync('user_email', email);
    await SecureStore.setItemAsync('user_id', userId);
    await SecureStore.setItemAsync('device_id', deviceId);

    // Store user in Realm database
    const user = {
      id: userId,
      email,
      deviceId,
      subscriptionTier: 'free',
      startDate: new Date(),
      purchaseDate: null,
      receiptToken: null,
      scansThisMonth: 0,
      lastResetDate: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    realm.write(() => {
      realm.create('User', user);
    });

    console.log('User initialized securely');
    return user;
  } catch (error) {
    console.error('Initialize user error:', error);
    throw error;
  }
};

/**
 * Get current user with secure retrieval
 */
export const getCurrentUser = async () => {
  try {
    const userId = await SecureStore.getItemAsync('user_id');
    if (!userId) return null;

    const user = realm.objectForPrimaryKey('User', userId);
    return user ? JSON.parse(JSON.stringify(user)) : null;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email) => {
  try {
    const users = realm.objects('User').filtered(`email = "${email}"`);
    return users.length > 0 ? JSON.parse(JSON.stringify(users[0])) : null;
  } catch (error) {
    console.error('Get user by email error:', error);
    throw error;
  }
};

/**
 * Update subscription tier with purchase validation
 */
export const updateSubscriptionTier = async (userId, newTier, receiptToken) => {
  try {
    realm.write(() => {
      const user = realm.objectForPrimaryKey('User', userId);
      if (user) {
        user.subscriptionTier = newTier;
        user.purchaseDate = new Date();
        user.receiptToken = receiptToken;
        user.scansThisMonth = 0; // Reset scans on upgrade
        user.lastResetDate = new Date();
        user.updatedAt = new Date();
      }
    });

    // Store receipt token securely
    if (receiptToken) {
      await SecureStore.setItemAsync(`receipt_${userId}`, receiptToken);
    }

    const user = realm.objectForPrimaryKey('User', userId);
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error('Update subscription error:', error);
    throw error;
  }
};

/**
 * Record scan and check limits
 */
export const recordScanAndCheckLimit = async (userId) => {
  try {
    const user = realm.objectForPrimaryKey('User', userId);
    if (!user) throw new Error('User not found');

    // Check if monthly reset needed
    const now = new Date();
    const lastReset = new Date(user.lastResetDate);
    
    if (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    ) {
      // Reset monthly count
      realm.write(() => {
        user.scansThisMonth = 0;
        user.lastResetDate = new Date();
      });
    }

    // Check tier limits
    const tierLimits = {
      free: 10,
      pro: null, // unlimited
      super_vip: null, // unlimited
    };

    const limit = tierLimits[user.subscriptionTier];

    // If unlimited, always allow
    if (limit === null) {
      realm.write(() => {
        user.scansThisMonth += 1;
        user.updatedAt = new Date();
      });
      return { allowed: true, remaining: null, unlimited: true };
    }

    // Check if under limit
    if (user.scansThisMonth >= limit) {
      return { allowed: false, remaining: 0, unlimited: false };
    }

    // Increment count
    realm.write(() => {
      user.scansThisMonth += 1;
      user.updatedAt = new Date();
    });

    return {
      allowed: true,
      remaining: limit - user.scansThisMonth,
      unlimited: false,
    };
  } catch (error) {
    console.error('Record scan error:', error);
    throw error;
  }
};

/**
 * Get scan usage for current month
 */
export const getScanUsage = async (userId) => {
  try {
    const user = realm.objectForPrimaryKey('User', userId);
    if (!user) throw new Error('User not found');

    const tierLimits = {
      free: 10,
      pro: null,
      super_vip: null,
    };

    const limit = tierLimits[user.subscriptionTier];

    return {
      used: user.scansThisMonth,
      limit,
      percentage: limit ? Math.round((user.scansThisMonth / limit) * 100) : 0,
      unlimited: limit === null,
      tier: user.subscriptionTier,
    };
  } catch (error) {
    console.error('Get scan usage error:', error);
    throw error;
  }
};

/**
 * Add VIP contact (Super VIP tier only)
 */
export const addVIPContact = async (userId, contactData) => {
  try {
    const user = realm.objectForPrimaryKey('User', userId);
    if (!user) throw new Error('User not found');

    if (user.subscriptionTier !== 'super_vip') {
      throw new Error('VIP contact access requires Super VIP tier');
    }

    const vipContact = {
      id: uuidv4(),
      userId,
      ...contactData,
      vipBadge: true,
      isBookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    realm.write(() => {
      realm.create('VIPContact', vipContact);
    });

    return vipContact;
  } catch (error) {
    console.error('Add VIP contact error:', error);
    throw error;
  }
};

/**
 * Get all VIP contacts for user
 */
export const getVIPContacts = async (userId) => {
  try {
    const user = realm.objectForPrimaryKey('User', userId);
    if (!user) throw new Error('User not found');

    if (user.subscriptionTier !== 'super_vip') {
      return [];
    }

    const vipContacts = realm
      .objects('VIPContact')
      .filtered(`userId = "${userId}"`)
      .sorted('createdAt', true);

    return JSON.parse(JSON.stringify(vipContacts));
  } catch (error) {
    console.error('Get VIP contacts error:', error);
    throw error;
  }
};

/**
 * Verify receipt token (server-side validation placeholder)
 */
export const verifyReceiptToken = async (receiptToken, platform) => {
  try {
    // In production, this would validate against Apple/Google servers
    // For now, return mock validation
    console.log(`Receipt verification for ${platform}:`, receiptToken);
    return { valid: true, expiryDate: null };
  } catch (error) {
    console.error('Receipt verification error:', error);
    throw error;
  }
};

/**
 * Get secure user credentials
 */
export const getSecureCredentials = async (userId) => {
  try {
    const email = await SecureStore.getItemAsync('user_email');
    const deviceId = await SecureStore.getItemAsync('device_id');
    const receiptToken = await SecureStore.getItemAsync(`receipt_${userId}`);

    return {
      email,
      deviceId,
      receiptToken,
    };
  } catch (error) {
    console.error('Get secure credentials error:', error);
    throw error;
  }
};

/**
 * Clear secure storage (on logout)
 */
export const clearSecureStorage = async () => {
  try {
    await SecureStore.deleteItemAsync('user_email');
    await SecureStore.deleteItemAsync('user_id');
    await SecureStore.deleteItemAsync('device_id');
    console.log('Secure storage cleared');
  } catch (error) {
    console.error('Clear secure storage error:', error);
  }
};

/**
 * Close database
 */
export const closeSecureDatabase = () => {
  if (realm) {
    realm.close();
  }
};
