# Native Android/iOS Build Guide (Capacitor)

This project is a Next.js app configured with Capacitor so it can run as native Android and iOS apps, including push notifications and local reminder notifications.

---

## 1) Prerequisites

### Common

- Node.js 18+ and npm
- Project dependencies installed:
  ```bash
  npm install
  ```
- A successful production web build:
  ```bash
  npm run build
  ```

### Android

- Android Studio (latest stable)
- Android SDK (via Android Studio SDK Manager)
- Java 17 (or Android Studio bundled JDK)
- Android device (USB debugging enabled) and/or Android Emulator

### iOS (macOS only)

- macOS with latest stable Xcode
- Xcode Command Line Tools
- CocoaPods (`sudo gem install cocoapods` if not already installed)
- Apple Developer account (required for real-device push and App Store distribution)
- iOS Simulator and/or physical iPhone

---

## 2) APK Build Process (Android)

### Step A: Build and sync web assets into Android project

From repository root:

```bash
npm run build
npm run cap:sync
```

### Step B: Open Android project in Android Studio

```bash
npm run cap:open:android
```

### Step C: Configure Android app signing

In Android Studio:

1. `Build` → `Generate Signed Bundle / APK`
2. Choose `APK`
3. Create/select keystore
4. Select `release` build type
5. Build APK

The generated release APK is typically under:

- `android/app/release/` or
- `android/app/build/outputs/apk/release/`

### Step D: Install APK on device

- Transfer APK to device and install, or
- Use `adb install <path-to-apk>`

> If install is blocked, allow installs from unknown sources in Android settings.

---

## 3) iOS Build Process (macOS/Xcode)

### Step A: Build and sync web assets

```bash
npm run build
npm run cap:sync
```

### Step B: Open iOS project

```bash
npm run cap:open:ios
```

### Step C: Configure signing in Xcode

1. Select the app target in Xcode
2. `Signing & Capabilities` → choose Team
3. Ensure bundle ID is unique and matches your Apple setup
4. Select simulator or connected device
5. Press Run

### Step D: Create archive for App Store/TestFlight

1. Xcode `Product` → `Archive`
2. In Organizer, choose `Distribute App`
3. Upload to App Store Connect / TestFlight

---

## 4) Firebase Setup (FCM for Android Push)

1. Create/select project in Firebase Console
2. Add Android app with package ID matching Capacitor app ID (or Android application ID)
3. Download `google-services.json`
4. Place it in:
   - `android/app/google-services.json`
5. Enable Cloud Messaging in Firebase
6. Send a test push from Firebase Console

Also verify Android notification permission/channel behavior on Android 13+.

---

## 5) Apple Configuration (APNs for iOS Push)

1. In Apple Developer account, enable Push Notifications capability for your App ID
2. In App Store Connect / Certificates, create APNs key (or cert) and link it to your app
3. In Firebase (if using FCM for iOS as well), upload APNs key under iOS app settings
4. In Xcode, add `Push Notifications` and `Background Modes` (Remote notifications) capabilities
5. Build and run on a real iPhone (simulator cannot receive APNs pushes)

---

## 6) Testing (Emulators and Real Devices)

### Android Emulator

- Start emulator from Android Studio
- Build and run debug app
- Test in-app reminders and notification permissions

### Android Real Device

- Enable Developer Options + USB Debugging
- Run from Android Studio or install APK manually
- Verify direct message push notifications and activity reminder notifications

### iOS Simulator

- Great for UI/functional checks
- Limited for full push notification validation

### iOS Real Device

- Required for APNs push verification
- Test permissions flow, foreground/background behavior, and notification tap navigation

---

## 7) App Store Submission

### Google Play (Android)

- Prefer `.aab` for Play Store upload (APK useful for direct distribution/testing)
- Create Play Console app listing (screenshots, privacy policy, content rating)
- Upload signed release artifact
- Complete testing track rollout before production

### Apple App Store (iOS)

- Use Xcode archive upload to App Store Connect
- Fill app metadata, screenshots, age/content ratings, privacy labels
- Configure push-notification usage descriptions in app metadata and plist as required
- Submit for review and monitor rejection feedback for compliance fixes

---

## 8) Troubleshooting

### `npx cap sync` does not reflect latest web code

- Re-run:
  ```bash
  npm run build
  npm run cap:sync
  ```
- Confirm `capacitor.config.ts` uses `webDir: '.next'` (as in this project)

### Android build fails due to SDK/JDK mismatch

- Update Android SDK packages in SDK Manager
- Ensure Gradle uses Java 17-compatible JDK

### Notifications not arriving on Android

- Verify Firebase project/package ID mapping
- Confirm device granted notifications permission
- Check token registration and backend push payload format

### Notifications not arriving on iOS

- Test on real device (not simulator)
- Confirm APNs key/certificate configuration
- Verify push capability enabled in both Apple portal and Xcode target

### Xcode signing/provisioning errors

- Re-select Team in `Signing & Capabilities`
- Ensure bundle identifier matches provisioning profile
- Clean build folder and re-archive

### App rejected by store

- Review privacy disclosures, permission explanations, and metadata
- Ensure notification behavior matches declared app purpose
- Resolve policy issues, increment version/build number, and resubmit

---

## Recommended Native Build Flow (Quick Reference)

```bash
npm install
npm run build
npm run cap:sync
npm run cap:open:android   # or npm run cap:open:ios
```

Then complete signing/distribution in Android Studio or Xcode.
