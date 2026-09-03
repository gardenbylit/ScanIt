# ScanIt - Business Card Scanner & Contact Manager

A cross-platform mobile application for scanning, storing, and managing business cards with intelligent OCR, secure data storage, and tiered subscriptions.

**[Download from App Store](#download) | [Features](#features) | [Setup Guide](#setup-guide) | [Publishing](#publishing)**

---

## Features

### 📱 Core Features
- **Smart Card Scanning**: Real-time camera OCR for business card text extraction
- **Contact Management**: Store, edit, search, and organize contacts
- **Cloud Sync**: Seamless backup and restoration across devices
- **Manual Editing**: Fine-tune extracted data before saving
- **Sharing**: Export contacts via email, messaging, or vCard format
- **VIP Contacts**: Mark and organize high-priority contacts (Super VIP tier)

### 🔒 Security
- **Encrypted Storage**: Local data encrypted with Realm Database
- **Secure Authentication**: SecureStore for sensitive credentials
- **Device Binding**: User data tied to specific device
- **GDPR Compliant**: Full data deletion on request

### 💰 Subscription Tiers
| Feature | Free | Pro | Super VIP |
|---------|------|-----|-----------|
| Scans/Month | 10 | ∞ | ∞ |
| Storage | 100 MB | 2 GB | 10 GB |
| Contacts | 50 | ∞ | ∞ |
| Cloud Sync | ✗ | ✓ | ✓ |
| VIP Access | ✗ | ✗ | ✓ |
| Analytics | ✗ | ✗ | ✓ |
| **Price** | **Free** | **$0.99** | **$4.99** |

---

## Download

### 📲 iOS (Apple App Store)
1. Open **App Store** on your iPhone/iPad
2. Search for **"ScanIt"**
3. Tap **Get** → Authenticate with Face ID/Touch ID
4. Wait for installation to complete
5. Launch the app and create an account

**[Direct Link - Coming Soon](https://apps.apple.com/app/scanit)**

### 🤖 Android (Google Play Store)
1. Open **Google Play Store** on your Android device
2. Search for **"ScanIt Business Card Scanner"**
3. Tap **Install**
4. Wait for download to complete
5. Tap **Open** and grant camera permissions

**[Direct Link - Coming Soon](https://play.google.com/store/apps/details?id=com.gardenbylit.scanit)**

---

## Setup Guide

### Prerequisites
- **Node.js** 16+ and npm/yarn
- **React Native CLI** or **Expo CLI**
- **Android Studio** (for Android development)
- **Xcode** 14+ (for iOS development)
- **Git**

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/gardenbylit/ScanIt.git
cd ScanIt
```

#### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

#### 3. Install iOS Pods (macOS only)
```bash
cd ios
pod install
cd ..
```

#### 4. Setup Environment Variables
Create `.env` file:
```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
```

#### 5. Run on Development Environment

**iOS Simulator:**
```bash
npm run ios
# or
react-native run-ios
```

**Android Emulator:**
```bash
npm run android
# or
react-native run-android
```

**Expo (Easiest):**
```bash
npx expo start
# Scan QR code with Expo Go app
```

---

## Project Structure

```
ScanIt/
├── src/
│   ├── screens/
│   │   ├── ScannerScreen.js       # Main camera & OCR screen
│   │   ├── EditContactScreen.js   # Contact editor
│   │   ├── UpgradeScreen.js       # Pricing & tier management
│   │   └── ContactsScreen.js      # Contact list
│   ├── services/
│   │   ├── databaseService.js     # Realm database operations
│   │   ├── secureUserService.js   # User & subscription management
│   │   ├── subscriptionService.js # Tier & limit tracking
│   │   └── ocrService.js          # ML Kit integration
│   ├── context/
│   │   ├── ContactContext.js      # Contact state management
│   │   └── SubscriptionContext.js # Subscription state
│   ├── utils/
│   │   ├── permissions.js         # Camera/location permissions
│   │   └── validators.js          # Data validation
│   ├── styles/
│   │   ├── colors.js              # Color constants
│   │   └── spacing.js             # Spacing constants
│   └── hooks/
│       └── useContacts.js         # Custom contact hook
├── App.js                         # Entry point & navigation
├── package.json                   # Dependencies
├── android/                       # Android native code
├── ios/                          # iOS native code
└── README.md
```

---

## Key Technologies

### Frontend
- **React Native 0.72** - Cross-platform mobile development
- **React Navigation 6** - Navigation & routing
- **React Native Camera** - Camera integration
- **Expo** - Development tools

### Backend & Storage
- **Firebase** - Authentication, Firestore, Storage
- **Realm Database** - Local encrypted database
- **Expo SecureStore** - Secure credential storage

### AI & ML
- **Google ML Kit** - OCR for text extraction (via react-native-ml-kit)
- **TensorFlow Lite** - On-device ML models

### Payments & Monetization
- **App Store In-App Purchases** (iOS)
- **Google Play Billing** (Android)
- **RevenueCat** - Subscription management (optional)

---

## Configuration

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project "ScanIt"
3. Enable Authentication (Email/Password)
4. Create Firestore Database
5. Create Storage bucket
6. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
7. Place in `android/app/` and `ios/` respectively

### Google ML Kit Setup

**Android:**
```gradle
// android/build.gradle
implementation 'com.google.android.gms:play-services-mlkit-text-recognition:18.0.0'
```

**iOS:**
```ruby
# ios/Podfile
pod 'GoogleMLKit/TextRecognition'
```

---

## Building & Publishing

### iOS App Store

#### 1. Prepare Signing
```bash
cd ios
# Open Xcode and configure signing
open ScanIt.xcworkspace
```

#### 2. Build Archive
```bash
# In Xcode:
# Product → Archive
# Wait for build to complete
```

#### 3. Submit to App Store
```bash
# In Xcode Organizer:
# Select Archive → Distribute App
# Choose "App Store Connect"
# Follow submission wizard
```

#### 4. App Store Review
- Review takes 24-48 hours typically
- Monitor status in [App Store Connect](https://appstoreconnect.apple.com)

### Android Google Play Store

#### 1. Generate Signing Key
```bash
cd android/app

# Generate keystore
keytool -genkey -v -keystore release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias scanit

# Answer prompts (password, name, organization, etc.)
```

#### 2. Configure Signing in Gradle
```gradle
// android/app/build.gradle
android {
  signingConfigs {
    release {
      keyAlias 'scanit'
      keyPassword 'YOUR_KEY_PASSWORD'
      storeFile file('release.keystore')
      storePassword 'YOUR_STORE_PASSWORD'
    }
  }
  
  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}
```

#### 3. Build Release APK/AAB
```bash
cd android
./gradlew bundleRelease  # Generates AAB for Play Store
# or
./gradlew assembleRelease  # Generates APK
```

#### 4. Upload to Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app "ScanIt"
3. Fill store listing details
4. Upload AAB file to Internal Testing
5. Promote to Production

#### 5. Google Play Review
- Review takes 2-4 hours typically
- Monitor status in Play Console

---

## App Store Assets

### iOS - App Store Connect

**Screenshots:**
- Device: iPhone 6.7" (Max)
- Dimensions: 1242 x 2688 px
- Format: PNG or JPEG

**Required Screenshots (5+):**
1. Camera scanning interface
2. Contact preview after scan
3. Contacts list view
4. Editing interface
5. Pricing/upgrade screen

**App Preview Video (15-30 sec):**
- Show scanning workflow
- Contact management
- Upgrade flow

**App Icon:**
- 1024 x 1024 px
- PNG format
- No transparency on edges

**Description Examples:**
```
ScanIt makes managing business cards effortless. 
Scan cards with your camera, auto-extract contact 
info, and organize your network. Free tier: 10 scans/month. 
Pro: unlimited scans. Super VIP: exclusive features.

✨ Features:
• Instant card scanning with OCR
• Secure contact storage
• Cloud backup & sync
• Share contacts easily
• Upgrade to unlock unlimited scans
```

### Android - Google Play Store

**Screenshots:**
- Device: Nexus 5X (5.2")
- Dimensions: 1080 x 1920 px
- Format: PNG

**Feature Graphic:**
- 1024 x 500 px
- PNG format

**App Icon:**
- 512 x 512 px
- PNG format

**Description:**
Similar to iOS, 4000 character limit

---

## Distribution Checklist

### Pre-Launch
- [ ] Complete user onboarding flow
- [ ] Test all subscription tiers
- [ ] Verify camera permissions work
- [ ] Test OCR accuracy on 50+ cards
- [ ] Stress test with 1000+ contacts
- [ ] iOS: Configure App Privacy
- [ ] Android: Add app permissions to manifest
- [ ] Create privacy policy & terms
- [ ] Setup customer support email

### iOS App Store
- [ ] Create Apple Developer account ($99/year)
- [ ] Create App ID in Apple Developer
- [ ] Setup certificates & provisioning profiles
- [ ] Create app in App Store Connect
- [ ] Add screenshots & preview video
- [ ] Configure pricing
- [ ] Fill app description & keywords
- [ ] Set age rating
- [ ] Submit for review

### Android Google Play
- [ ] Create Google Play Developer account ($25 one-time)
- [ ] Generate release signing key
- [ ] Create app in Play Console
- [ ] Add screenshots & feature graphic
- [ ] Configure pricing
- [ ] Fill store listing
- [ ] Set content rating
- [ ] Upload AAB to internal testing
- [ ] Test via internal testing link
- [ ] Promote to production

---

## API Documentation

### Subscription Context
```javascript
import { useSubscription } from './context/SubscriptionContext';

const { 
  user,           // Current user object
  scanUsage,      // { used, limit, percentage, unlimited }
  vipContacts,    // Array of VIP contacts
  canScan(),      // Check if scan allowed
  recordNewScan(), // Record a scan
  upgradeTier(tier, receiptToken), // Upgrade plan
  hasVIPAccess()  // Check VIP access
} = useSubscription();
```

### Contact Context
```javascript
import { useContacts } from './context/ContactContext';

const {
  contacts,
  getAllContacts(),
  addContact(data),
  updateContact(id, data),
  deleteContact(id),
  searchContacts(query)
} = useContacts();
```

---

## Troubleshooting

### Camera Not Working
```bash
# Clear cache and reinstall
npm run android -- --reset-cache
npm run ios -- --clean
```

### Firebase Connection Issues
- Verify `.env` variables
- Check Firebase security rules
- Ensure internet connection

### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Gradle cache (Android)
cd android && ./gradlew clean && cd ..

# Clear pod cache (iOS)
cd ios && rm -rf Pods && pod install && cd ..
```

---

## Support & Contact

- **Email**: support@scanit.app
- **Website**: www.scanit.app
- **GitHub Issues**: [ScanIt Issues](https://github.com/gardenbylit/ScanIt/issues)

---

## License

MIT License - See LICENSE.md for details

---

## Roadmap

### v1.1 (Next Release)
- [ ] Cloud sync with real-time updates
- [ ] Contact groups/categories
- [ ] Multiple scan languages support
- [ ] Batch export (CSV, PDF)

### v2.0 (Future)
- [ ] Team/business plans
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] AI-powered contact recommendations
- [ ] Desktop app (Electron)

---

**Built with ❤️ by GardenByLit**
