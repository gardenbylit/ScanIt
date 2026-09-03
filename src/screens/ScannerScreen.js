import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { useSubscription } from '../context/SubscriptionContext';
import { useContacts } from '../context/ContactContext';

const { width: screenWidth } = Dimensions.get('window');

const ScannerScreen = ({ navigation }) => {
  const cameraRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [flashMode, setFlashMode] = useState(RNCamera.Constants.FlashMode.off);
  const [scannedData, setScannedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const { canScan, recordNewScan, scanUsage } = useSubscription();
  const { addContact } = useContacts();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const permission = await RNCamera.checkVideoAuthorizationStatus();
      if (permission === false) {
        Alert.alert(
          'Camera Permission',
          'Camera permission is required to scan business cards.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const takePicture = async () => {
    if (!canScan()) {
      Alert.alert(
        'Scan Limit Reached',
        `You've reached your monthly scan limit (${scanUsage?.limit}).\nUpgrade to Pro or Super VIP for unlimited scans.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => navigation.navigate('Upgrade'),
          },
        ]
      );
      return;
    }

    if (!cameraRef.current) return;

    try {
      setLoading(true);
      const options = {
        quality: 0.8,
        base64: true,
        orientation: 'portrait',
      };

      const data = await cameraRef.current.takePictureAsync(options);

      // Simulate OCR processing
      const extractedData = await processBusinessCard(data);
      setScannedData(extractedData);
      setShowPreview(true);

      // Record the scan
      await recordNewScan();
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processBusinessCard = async (imageData) => {
    // Simulate OCR text extraction
    // In production, integrate with Google ML Kit or Azure Computer Vision
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          firstName: 'John',
          lastName: 'Doe',
          title: 'Product Manager',
          company: 'Tech Corp Inc.',
          email: 'john.doe@techcorp.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business Ave, Tech City, TC 12345',
          website: 'www.techcorp.com',
          notes: 'Met at conference 2024',
          image: imageData.uri,
        });
      }, 2000);
    });
  };

  const handleSaveContact = async () => {
    try {
      setLoading(true);
      await addContact(scannedData);

      Alert.alert('Success', 'Contact saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setShowPreview(false);
            setScannedData(null);
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAndSave = () => {
    navigation.navigate('EditContact', {
      contact: scannedData,
      onSave: async (editedData) => {
        try {
          setLoading(true);
          await addContact(editedData);
          Alert.alert('Success', 'Contact saved!');
          setShowPreview(false);
          setScannedData(null);
        } catch (error) {
          Alert.alert('Error', 'Failed to save contact');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        flashMode={flashMode}
        captureAudio={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu" size={28} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.scanCounter}>
            <Text style={styles.scanCounterText}>
              {scanUsage?.used || 0}/{scanUsage?.limit || '∞'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              setFlashMode(
                flashMode === RNCamera.Constants.FlashMode.off
                  ? RNCamera.Constants.FlashMode.on
                  : RNCamera.Constants.FlashMode.off
              )
            }
          >
            <Ionicons
              name={
                flashMode === RNCamera.Constants.FlashMode.on
                  ? 'flash'
                  : 'flash-off'
              }
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Guide Frame */}
        <View style={styles.guideContainer}>
          <View style={styles.guideFrame} />
          <Text style={styles.guideText}>Align business card within frame</Text>
        </View>

        {/* Footer Controls */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.galleryButton}>
            <Ionicons name="images" size={24} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() =>
              Alert.alert(
                'Scanning Tips',
                '• Place card flat on a light surface\n• Ensure good lighting\n• Keep camera steady\n• Avoid shadows on the card'
              )
            }
          >
            <Ionicons name="help-circle" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </RNCamera>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <SafeAreaView style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={() => setShowPreview(false)}>
              <Ionicons name="close" size={28} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Review Contact</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.previewContent}>
            {scannedData?.image && (
              <Image
                source={{ uri: scannedData.image }}
                style={styles.previewImage}
              />
            )}

            <View style={styles.dataContainer}>
              <PreviewField
                icon="person"
                label="Name"
                value={`${scannedData?.firstName} ${scannedData?.lastName}`}
              />
              <PreviewField
                icon="briefcase"
                label="Title"
                value={scannedData?.title}
              />
              <PreviewField
                icon="business"
                label="Company"
                value={scannedData?.company}
              />
              <PreviewField
                icon="mail"
                label="Email"
                value={scannedData?.email}
              />
              <PreviewField
                icon="call"
                label="Phone"
                value={scannedData?.phone}
              />
              <PreviewField
                icon="location"
                label="Address"
                value={scannedData?.address}
              />
              <PreviewField
                icon="globe"
                label="Website"
                value={scannedData?.website}
              />
            </View>

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEditAndSave}
              >
                <Ionicons name="pencil" size={20} color={colors.primary} />
                <Text style={styles.editButtonText}>Edit Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveContact}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.white}
                    />
                    <Text style={styles.saveButtonText}>Save Contact</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const PreviewField = ({ icon, label, value }) => (
  <View style={styles.fieldContainer}>
    <View style={styles.fieldLabel}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.fieldLabelText}>{label}</Text>
    </View>
    <Text style={styles.fieldValue}>{value || 'Not detected'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButton: {
    padding: spacing.medium,
  },
  scanCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
    borderRadius: 20,
  },
  scanCounterText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: screenWidth - spacing.xlarge * 2,
    aspectRatio: 1.5,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  guideText: {
    color: colors.white,
    fontSize: 14,
    marginTop: spacing.large,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.large,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  galleryButton: {
    padding: spacing.medium,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: colors.white,
  },
  helpButton: {
    padding: spacing.medium,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  previewContent: {
    flex: 1,
    padding: spacing.large,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.large,
  },
  dataContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.large,
    marginBottom: spacing.large,
  },
  fieldContainer: {
    marginBottom: spacing.large,
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  fieldLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.lightText,
    marginLeft: spacing.small,
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.medium,
    marginBottom: spacing.large,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.medium,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.small,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.small,
  },
});

export default ScannerScreen;
