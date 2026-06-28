# 📱 Flutter Mobile App Development Guide

Sichere, skalierbare Android (+ iOS) App mit Flutter & Dart.

## 🚀 Quick Start

### Installation

```bash
# Flutter SDK installieren
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# Android Studio Setup
# Downloade: https://developer.android.com/studio

# Neue Flutter App
flutter create my_app
cd my_app
flutter run
```

### Project Structure

```
lib/
├── main.dart                    # Entry point
├── config/
│   ├── app_config.dart
│   ├── api_client.dart
│   └── security.dart
├── screens/
│   ├── login_screen.dart
│   ├── home_screen.dart
│   └── settings_screen.dart
├── widgets/
│   ├── custom_button.dart
│   ├── error_dialog.dart
│   └── loading_spinner.dart
├── services/
│   ├── auth_service.dart
│   ├── api_service.dart
│   └── storage_service.dart
├── models/
│   ├── user_model.dart
│   ├── request_model.dart
│   └── response_model.dart
├── providers/
│   ├── auth_provider.dart
│   ├── app_provider.dart
│   └── theme_provider.dart
├── utils/
│   ├── constants.dart
│   ├── validators.dart
│   └── logger.dart
└── resources/
    ├── strings.dart
    └── colors.dart
```

## 📦 Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.0.0
  riverpod: ^2.4.0
  
  # API & Networking
  dio: ^5.3.0
  retrofit: ^4.0.0
  
  # Storage
  flutter_secure_storage: ^9.0.0
  hive: ^2.2.0
  shared_preferences: ^2.2.0
  
  # Authentication
  google_sign_in: ^6.1.0
  firebase_auth: ^4.0.0
  
  # UI
  flutter_svg: ^2.0.0
  cupertino_icons: ^1.0.0
  smooth_page_indicator: ^1.1.0
  
  # Localization
  intl: ^0.19.0
  
  # Logging
  logger: ^2.0.0
  
  # JSON
  json_annotation: ^4.8.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  json_serializable: ^6.8.0
  build_runner: ^2.4.0
```

## 🔐 Security Implementation

### 1. Secure Storage

```dart
// lib/services/storage_service.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static const _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      keyCipherAlgorithm: KeyCipherAlgorithm.RSA_ECB_OAEPwithSHA_256andMGF1Padding,
    ),
  );

  static Future<void> saveToken(String token) async {
    await _secureStorage.write(
      key: 'auth_token',
      value: token,
    );
  }

  static Future<String?> getToken() async {
    return await _secureStorage.read(key: 'auth_token');
  }

  static Future<void> deleteToken() async {
    await _secureStorage.delete(key: 'auth_token');
  }
}
```

### 2. Certificate Pinning

```dart
// lib/config/api_client.dart
import 'dart:io';
import 'package:dio/dio.dart';

class ApiClient {
  late Dio _dio;

  ApiClient() {
    _setupDio();
  }

  void _setupDio() {
    _dio = Dio(
      BaseOptions(
        baseUrl: 'https://api.example.com',
        connectTimeout: Duration(seconds: 30),
        receiveTimeout: Duration(seconds: 30),
      ),
    );

    // Certificate Pinning
    (_dio.httpClientAdapter as DefaultHttpClientAdapter).onHttpClientCreate =
        (client) {
      client.badCertificateCallback = (cert, host, port) {
        // Pin specific certificates
        if (host == 'api.example.com') {
          // Verify certificate fingerprint
          return _verifyCertificate(cert);
        }
        return false;
      };
      return client;
    };

    // Add interceptors
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add auth token
          final token = getStoredToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            // Refresh token or logout
          }
          return handler.next(error);
        },
      ),
    );
  }

  bool _verifyCertificate(X509Certificate cert) {
    // Implement SHA256 fingerprint check
    String fingerprint = cert.sha256; // SHA256 hash of certificate
    const expectedFingerprints = [
      'AA:BB:CC:...',
    ];
    return expectedFingerprints.contains(fingerprint);
  }
}
```

### 3. Input Validation

```dart
// lib/utils/validators.dart
class Validators {
  static String? validateEmail(String? email) {
    if (email == null || email.isEmpty) {
      return 'Email erforderlich';
    }
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    if (!emailRegex.hasMatch(email)) {
      return 'Ungültige Email';
    }
    return null;
  }

  static String? validatePassword(String? password) {
    if (password == null || password.isEmpty) {
      return 'Passwort erforderlich';
    }
    if (password.length < 12) {
      return 'Mindestens 12 Zeichen';
    }
    if (!password.contains(RegExp(r'[A-Z]'))) {
      return 'Mindestens ein Großbuchstabe';
    }
    if (!password.contains(RegExp(r'[0-9]'))) {
      return 'Mindestens eine Zahl';
    }
    if (!password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) {
      return 'Mindestens ein Sonderzeichen';
    }
    return null;
  }
}
```

## 🏗️ State Management (Provider)

```dart
// lib/providers/auth_provider.dart
import 'package:flutter/material.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  User? _currentUser;
  bool _isLoading = false;

  bool get isAuthenticated => _token != null;
  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiClient().post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      _token = response['token'];
      _currentUser = User.fromJson(response['user']);
      
      await StorageService.saveToken(_token!);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    await StorageService.deleteToken();
    _token = null;
    _currentUser = null;
    notifyListeners();
  }
}
```

## 🧪 Testing

```dart
// test/services/storage_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('StorageService', () {
    test('saveToken should store token securely', () async {
      const testToken = 'test-token-123';
      
      await StorageService.saveToken(testToken);
      final retrieved = await StorageService.getToken();
      
      expect(retrieved, equals(testToken));
    });

    test('deleteToken should remove token', () async {
      const testToken = 'test-token-123';
      
      await StorageService.saveToken(testToken);
      await StorageService.deleteToken();
      final retrieved = await StorageService.getToken();
      
      expect(retrieved, isNull);
    });
  });
}
```

## 🔄 Build & Release

### Android

```bash
# Debug Build
flutter build apk --debug

# Release Build (Obfuscated)
flutter build apk --release --obfuscate --split-debug-info=build/app/outputs/symbols

# App Bundle (für Google Play)
flutter build appbundle --release --obfuscate

# Signing (mit key.properties)
# ~/.android/key.properties:
# storePassword=<password>
# keyPassword=<password>
# keyAlias=upload
# storeFile=<path-to-keystore>
```

### iOS

```bash
# Build für App Store
flutter build ios --release

# Create App Bundle
# In Xcode:
# 1. Open ios/Runner.xcworkspace
# 2. Product → Build For → Any iOS Device
# 3. Organizer → Distribute App
```

## 📋 Checklist vor Release

- [ ] Alle Tests grün
- [ ] Code obfusciert (Android)
- [ ] App signiert
- [ ] Version bumped (pubspec.yaml)
- [ ] Changelog updated
- [ ] Privacy Policy bereit
- [ ] Tested auf echtem Device
- [ ] Screenshot für Store
- [ ] Beschreibung & Keywords
- [ ] Berechtigungen minimal

## 🚀 Distribution

### Google Play Store

```
1. Register Developer Account ($25)
2. Create App → Fill details
3. Upload APK/AAB
4. Add screenshots (min 2, max 8)
5. Write description (max 4000 chars)
6. Set content rating
7. Set pricing
8. Submit for review
9. Wait 24-48 hours
```

### Links
- Flutter Docs: https://flutter.dev/docs
- Android Dev: https://developer.android.com
- Google Play Console: https://play.google.com/console
- OWASP Mobile Top 10: https://owasp.org/www-project-mobile-top-10/
