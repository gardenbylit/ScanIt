import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  SUPER_VIP: 'super_vip',
};

export const TIER_LIMITS = {
  free: {
    scansPerMonth: 10,
    unlimitedScans: false,
    vipContactsAccess: false,
    price: 0,
    displayName: 'Free',
  },
  pro: {
    scansPerMonth: null, // unlimited
    unlimitedScans: true,
    vipContactsAccess: false,
    price: 0.99,
    displayName: 'Pro',
  },
  super_vip: {
    scansPerMonth: null, // unlimited
    unlimitedScans: true,
    vipContactsAccess: true,
    price: 4.99, // or subscription-based
    displayName: 'Super VIP',
  },
};

const STORAGE_KEY_SUBSCRIPTION = '@scanit_subscription';
const STORAGE_KEY_SCAN_COUNT = '@scanit_scan_count';
const STORAGE_KEY_SCAN_RESET_DATE = '@scanit_scan_reset_date';

/**
 * Initialize user subscription (called on first app launch)
 */
export const initializeSubscription = async () => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
    if (!existing) {
      const subscription = {
        userId: uuidv4(),
        tier: SUBSCRIPTION_TIERS.FREE,
        startDate: new Date().toISOString(),
        purchaseDate: null,
        receiptToken: null, // For in-app purchase verification
      };
      await AsyncStorage.setItem(
        STORAGE_KEY_SUBSCRIPTION,
        JSON.stringify(subscription)
      );
      await resetScanCount();
      return subscription;
    }
    return JSON.parse(existing);
  } catch (error) {
    console.error('Initialize subscription error:', error);
    throw error;
  }
};

/**
 * Get current user subscription
 */
export const getSubscription = async () => {
  try {
    const subscription = await AsyncStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
    return subscription ? JSON.parse(subscription) : null;
  } catch (error) {
    console.error('Get subscription error:', error);
    throw error;
  }
};

/**
 * Upgrade subscription tier
 */
export const upgradeSubscription = async (newTier, receiptToken) => {
  try {
    const subscription = await getSubscription();
    const updated = {
      ...subscription,
      tier: newTier,
      purchaseDate: new Date().toISOString(),
      receiptToken,
    };
    await AsyncStorage.setItem(
      STORAGE_KEY_SUBSCRIPTION,
      JSON.stringify(updated)
    );
    await resetScanCount(); // Reset count on upgrade
    return updated;
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    throw error;
  }
};

/**
 * Track scan usage
 */
export const recordScan = async () => {
  try {
    const subscription = await getSubscription();
    const tier = TIER_LIMITS[subscription.tier];

    // Unlimited scans tier check
    if (tier.unlimitedScans) {
      return { allowed: true, remaining: null };
    }

    // Check if reset needed (monthly reset)
    await checkAndResetMonthlyCount();

    const countStr = await AsyncStorage.getItem(STORAGE_KEY_SCAN_COUNT);
    let count = countStr ? parseInt(countStr, 10) : 0;
    const limit = tier.scansPerMonth;

    if (count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    count += 1;
    await AsyncStorage.setItem(STORAGE_KEY_SCAN_COUNT, count.toString());

    return {
      allowed: true,
      remaining: limit - count,
      limit,
    };
  } catch (error) {
    console.error('Record scan error:', error);
    throw error;
  }
};

/**
 * Get current scan usage
 */
export const getScanUsage = async () => {
  try {
    const subscription = await getSubscription();
    const tier = TIER_LIMITS[subscription.tier];

    if (tier.unlimitedScans) {
      return {
        used: 0,
        limit: null,
        percentage: 0,
        unlimited: true,
      };
    }

    await checkAndResetMonthlyCount();

    const countStr = await AsyncStorage.getItem(STORAGE_KEY_SCAN_COUNT);
    const used = countStr ? parseInt(countStr, 10) : 0;
    const limit = tier.scansPerMonth;

    return {
      used,
      limit,
      percentage: Math.round((used / limit) * 100),
      unlimited: false,
    };
  } catch (error) {
    console.error('Get scan usage error:', error);
    throw error;
  }
};

/**
 * Check if monthly reset is needed
 */
const checkAndResetMonthlyCount = async () => {
  try {
    const resetDateStr = await AsyncStorage.getItem(
      STORAGE_KEY_SCAN_RESET_DATE
    );
    const now = new Date();

    if (!resetDateStr) {
      await resetScanCount();
      return;
    }

    const resetDate = new Date(resetDateStr);
    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      await resetScanCount();
    }
  } catch (error) {
    console.error('Check reset error:', error);
  }
};

/**
 * Reset monthly scan count
 */
const resetScanCount = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_SCAN_COUNT, '0');
    await AsyncStorage.setItem(
      STORAGE_KEY_SCAN_RESET_DATE,
      new Date().toISOString()
    );
  } catch (error) {
    console.error('Reset scan count error:', error);
  }
};

/**
 * Check if user has VIP access
 */
export const hasVIPAccess = async () => {
  try {
    const subscription = await getSubscription();
    return subscription.tier === SUBSCRIPTION_TIERS.SUPER_VIP;
  } catch (error) {
    console.error('VIP check error:', error);
    return false;
  }
};

/**
 * Get tier info
 */
export const getTierInfo = (tier) => {
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
};
