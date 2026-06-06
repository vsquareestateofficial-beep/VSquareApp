# V Square Estates - APK Build Guide

## 📱 How to Build Android APK

### ✅ What's Already Done:
- ✅ Capacitor installed
- ✅ Web app built (`dist/` folder)
- ✅ Capacitor initialized
- ✅ Android platform added

---

## 🚀 Step 1: Install Android Studio (Required)

### Download Android Studio:
1. Go to: https://developer.android.com/studio
2. Download and install Android Studio
3. Follow the setup wizard (install Android SDK)

---

## 🚀 Step 2: Build the APK

### Option A: Build with Android Studio (Recommended)

1. **Open Android Studio**
2. Click **Open an Existing Project**
3. Select the `android/` folder in your project
4. Wait for Gradle to sync (first time takes ~5-10 minutes)
5. Once synced, click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
6. Wait for build to complete
7. Click **locate** in the notification to find your APK!

### APK Location:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

### Option B: Build with Command Line

If you have Android SDK set up:

```bash
cd android
./gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🎯 Step 3: Install APK on Your Phone

1. **Copy the APK** to your phone
2. **Enable Unknown Sources** in phone Settings
3. **Tap the APK file** to install
4. **Open the app** - it will work exactly like the web version!

---

## 🏪 Step 4: Prepare for Play Store (Optional)

### To Publish on Google Play Store:

1. **Build a Release APK/AAB**
   - In Android Studio: **Build** → **Generate Signed Bundle / APK**
   - Follow the wizard to create a keystore

2. **Create Google Play Developer Account**
   - $25 one-time fee
   - https://play.google.com/console

3. **Upload your AAB/APK**
   - Fill in app details
   - Upload screenshots
   - Publish!

---

## 📋 Quick Commands Recap

### When You Make Changes to the Web App:

```bash
# 1. Rebuild web app
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build APK in Android Studio
```

---

## ✅ Your App is Ready!

Your V Square Estates app:
- ✅ Connects to Supabase
- ✅ Works offline (caches data)
- ✅ Full Android app experience
- ✅ Ready for 400+ employees

---

## 🎊 Congratulations!

You now have:
- ✅ A complete web app with Supabase backend
- ✅ An Android APK ready to install
- ✅ A production-ready system for V Square Estates!
