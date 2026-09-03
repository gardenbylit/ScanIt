import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getCurrentUser,
  recordScanAndCheckLimit,
  getScanUsage,
  updateSubscriptionTier,
  getVIPContacts,
  initializeUser,
} from '../services/secureUserService';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [scanUsage, setScanUsage] = useState(null);
  const [vipContacts, setVIPContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize user on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await refreshScanUsage(currentUser.id);
          if (currentUser.subscriptionTier === 'super_vip') {
            await loadVIPContacts(currentUser.id);
          }
        }
      } catch (err) {
        console.error('Initialize app error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Setup new user
  const setupNewUser = useCallback(async (email) => {
    try {
      setLoading(true);
      const newUser = await initializeUser(email);
      setUser(newUser);
      await refreshScanUsage(newUser.id);
      setError(null);
      return newUser;
    } catch (err) {
      console.error('Setup user error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh scan usage
  const refreshScanUsage = useCallback(async (userId) => {
    try {
      const usage = await getScanUsage(userId);
      setScanUsage(usage);
    } catch (err) {
      console.error('Refresh scan usage error:', err);
      setError(err.message);
    }
  }, []);

  // Record a scan
  const recordNewScan = useCallback(async () => {
    if (!user) throw new Error('User not initialized');

    try {
      const result = await recordScanAndCheckLimit(user.id);
      
      if (result.allowed) {
        // Update local user scan count
        setUser(prev => ({
          ...prev,
          scansThisMonth: prev.scansThisMonth + 1,
        }));
        await refreshScanUsage(user.id);
      }

      return result;
    } catch (err) {
      console.error('Record scan error:', err);
      setError(err.message);
      throw err;
    }
  }, [user, refreshScanUsage]);

  // Upgrade subscription
  const upgradeTier = useCallback(async (newTier, receiptToken) => {
    if (!user) throw new Error('User not initialized');

    try {
      setLoading(true);
      const updatedUser = await updateSubscriptionTier(user.id, newTier, receiptToken);
      setUser(updatedUser);
      await refreshScanUsage(user.id);

      // Load VIP contacts if upgraded to super_vip
      if (newTier === 'super_vip') {
        await loadVIPContacts(user.id);
      }

      setError(null);
      return updatedUser;
    } catch (err) {
      console.error('Upgrade tier error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, refreshScanUsage]);

  // Load VIP contacts
  const loadVIPContacts = useCallback(async (userId) => {
    try {
      const contacts = await getVIPContacts(userId);
      setVIPContacts(contacts);
    } catch (err) {
      console.error('Load VIP contacts error:', err);
      setError(err.message);
    }
  }, []);

  // Check if scan is allowed
  const canScan = useCallback(() => {
    if (!scanUsage) return false;
    if (scanUsage.unlimited) return true;
    return scanUsage.used < scanUsage.limit;
  }, [scanUsage]);

  // Check if has VIP access
  const hasVIPAccess = useCallback(() => {
    return user?.subscriptionTier === 'super_vip';
  }, [user]);

  // Get tier display info
  const getTierInfo = useCallback(() => {
    const tiers = {
      free: {
        name: 'Free',
        limit: 10,
        price: '$0',
        features: ['10 scans/month', 'Basic storage', 'Standard contacts'],
        badge: null,
      },
      pro: {
        name: 'Pro',
        limit: null,
        price: '$0.99',
        features: ['Unlimited scans', 'Enhanced storage', 'Priority support'],
        badge: 'PRO',
      },
      super_vip: {
        name: 'Super VIP',
        limit: null,
        price: '$4.99',
        features: [
          'Unlimited scans',
          'VIP contacts access',
          'Premium analytics',
          '24/7 support',
        ],
        badge: 'VIP',
      },
    };

    return tiers[user?.subscriptionTier] || tiers.free;
  }, [user]);

  const value = {
    // State
    user,
    scanUsage,
    vipContacts,
    loading,
    error,

    // Actions
    setupNewUser,
    recordNewScan,
    upgradeTier,
    refreshScanUsage,
    loadVIPContacts,

    // Checks
    canScan,
    hasVIPAccess,
    getTierInfo,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
