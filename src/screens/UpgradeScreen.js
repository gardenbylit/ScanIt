import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { useSubscription } from '../context/SubscriptionContext';

const UpgradeScreen = ({ navigation }) => {
  const { user, upgradeTier, loading, hasVIPAccess } = useSubscription();
  const [selectedTier, setSelectedTier] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'Forever',
      description: 'Perfect for getting started',
      features: [
        { icon: 'scan', text: '10 scans/month' },
        { icon: 'lock', text: 'Basic storage' },
        { icon: 'person', text: 'Standard contacts' },
        { icon: 'close', text: 'No VIP access' },
      ],
      current: user?.subscriptionTier === 'free',
      cta: 'Current Plan',
      ctaDisabled: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$0.99',
      period: 'One-time',
      description: 'For power users',
      features: [
        { icon: 'infinite', text: 'Unlimited scans' },
        { icon: 'cloud', text: 'Enhanced storage' },
        { icon: 'person-add', text: 'Unlimited contacts' },
        { icon: 'close', text: 'No VIP access' },
      ],
      current: user?.subscriptionTier === 'pro',
      cta: 'Upgrade to Pro',
      ctaDisabled: user?.subscriptionTier === 'pro',
    },
    {
      id: 'super_vip',
      name: 'Super VIP',
      price: '$4.99',
      period: 'One-time',
      description: 'Unlock everything',
      features: [
        { icon: 'infinite', text: 'Unlimited scans' },
        { icon: 'cloud', text: 'Premium storage' },
        { icon: 'star', text: 'VIP contacts access' },
        { icon: 'analytics', text: 'Advanced analytics' },
      ],
      current: user?.subscriptionTier === 'super_vip',
      cta: 'Upgrade to Super VIP',
      ctaDisabled: user?.subscriptionTier === 'super_vip',
      badge: 'MOST POPULAR',
    },
  ];

  const handleUpgrade = async (tierId) => {
    try {
      setProcessingPayment(true);
      setSelectedTier(tierId);

      // Mock payment processing
      // In production, integrate with react-native-iap for App Store/Play Store
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock receipt token
      const mockReceiptToken = `receipt_${Date.now()}_${tierId}`;

      await upgradeTier(tierId, mockReceiptToken);

      Alert.alert(
        'Success',
        `Successfully upgraded to ${tiers.find(t => t.id === tierId).name}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedTier(null);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to process upgrade');
    } finally {
      setProcessingPayment(false);
      setSelectedTier(null);
    }
  };

  const renderTierCard = ({ item }) => (
    <View
      style={[
        styles.tierCard,
        item.current && styles.tierCardCurrent,
        item.id === 'super_vip' && styles.tierCardPopular,
      ]}
    >
      {item.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}

      <Text style={styles.tierName}>{item.name}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.period}>/{item.period}</Text>
      </View>
      <Text style={styles.tierDescription}>{item.description}</Text>

      <View style={styles.featuresList}>
        {item.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons
              name={feature.icon}
              size={18}
              color={item.id === 'super_vip' ? colors.primary : colors.lightGray}
              style={styles.featureIcon}
            />
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.ctaButton,
          item.id === 'super_vip' && styles.ctaButtonPrimary,
          item.ctaDisabled && styles.ctaButtonDisabled,
        ]}
        onPress={() => handleUpgrade(item.id)}
        disabled={item.ctaDisabled || processingPayment}
      >
        {processingPayment && selectedTier === item.id ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text
            style={[
              styles.ctaText,
              item.ctaDisabled && styles.ctaTextDisabled,
            ]}
          >
            {item.cta}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Upgrade Your Experience</Text>
          <Text style={styles.subtitle}>
            Choose a plan that fits your scanning needs
          </Text>
        </View>

        <FlatList
          data={tiers}
          renderItem={renderTierCard}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          style={styles.tiersList}
        />

        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>Plan Comparison</Text>
          <ComparisonTable />
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <FAQItem
            question="Can I change my plan later?"
            answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
          />
          <FAQItem
            question="Is there a free trial?"
            answer="The Free tier is always available with 10 scans per month. Try it before upgrading!"
          />
          <FAQItem
            question="How do I get a refund?"
            answer="We offer a 7-day money-back guarantee on all paid plans. Contact support for assistance."
          />
          <FAQItem
            question="What about my data if I downgrade?"
            answer="Your data is always safe. Downgrading won't delete your contacts or history."
          />
        </View>

        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <TouchableOpacity style={styles.supportButton}>
            <Ionicons name="mail" size={20} color={colors.primary} />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            Prices may vary by region. All prices in USD.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ComparisonTable = () => (
  <View style={styles.table}>
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.tableCellHeader]}>Feature</Text>
      <Text style={[styles.tableCell, styles.tableCellHeader]}>Free</Text>
      <Text style={[styles.tableCell, styles.tableCellHeader]}>Pro</Text>
      <Text style={[styles.tableCell, styles.tableCellHeader]}>VIP</Text>
    </View>
    {[
      ['Scans/Month', '10', '∞', '∞'],
      ['Storage', '100 MB', '2 GB', '10 GB'],
      ['Contacts', '50', '∞', '∞'],
      ['Cloud Sync', '✗', '✓', '✓'],
      ['VIP Access', '✗', '✗', '✓'],
      ['Analytics', '✗', '✗', '✓'],
    ].map((row, idx) => (
      <View key={idx} style={styles.tableRow}>
        {row.map((cell, cellIdx) => (
          <Text
            key={cellIdx}
            style={[
              styles.tableCell,
              cellIdx === 0 && styles.tableCellLabel,
            ]}
          >
            {cell}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.primary}
        />
      </TouchableOpacity>
      {expanded && (
        <Text style={styles.faqAnswer}>{answer}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: spacing.large,
  },
  headerSection: {
    marginBottom: spacing.xlarge,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.medium,
  },
  subtitle: {
    fontSize: 16,
    color: colors.lightText,
    lineHeight: 24,
  },
  tiersList: {
    marginBottom: spacing.xlarge,
  },
  tierCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.large,
    marginBottom: spacing.large,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tierCardCurrent: {
    borderColor: colors.primary,
    backgroundColor: '#F0F8FF',
  },
  tierCardPopular: {
    borderColor: colors.primary,
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 20,
    marginBottom: spacing.medium,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  tierName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.small,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.medium,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
  },
  period: {
    fontSize: 14,
    color: colors.lightText,
    marginLeft: spacing.small,
  },
  tierDescription: {
    fontSize: 14,
    color: colors.lightText,
    marginBottom: spacing.large,
  },
  featuresList: {
    marginBottom: spacing.large,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  featureIcon: {
    marginRight: spacing.medium,
    width: 24,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: colors.border,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaButtonPrimary: {
    backgroundColor: colors.primary,
  },
  ctaButtonDisabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.5,
  },
  ctaText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  ctaTextDisabled: {
    color: colors.lightGray,
  },
  comparisonSection: {
    marginBottom: spacing.xlarge,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.large,
  },
  table: {
    backgroundColor: colors.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  tableCellHeader: {
    fontWeight: '700',
    backgroundColor: colors.background,
  },
  tableCellLabel: {
    textAlign: 'left',
    fontWeight: '600',
  },
  faqSection: {
    marginBottom: spacing.xlarge,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.large,
  },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: spacing.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 13,
    color: colors.lightText,
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.medium,
    lineHeight: 20,
  },
  supportSection: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.large,
    marginBottom: spacing.xlarge,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.medium,
  },
  supportButton: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  supportButtonText: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.medium,
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default UpgradeScreen;
