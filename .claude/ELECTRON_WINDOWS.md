# 💻 Electron Desktop App for Windows & macOS

Sichere, signable Desktop-Anwendung mit Electron + React + TypeScript.

## 🚀 Quick Start

### Setup

```bash
# Create Electron app with create-electron-app
npx create-electron-app my-app --template=webpack

# Or use electron-vite for better performance
npm create electron-vite@latest my-app

# Setup
cd my-app
npm install

# Add React + TypeScript
npm install react react-dom
npm install -D @types/react @types/react-dom
npm install typescript ts-loader
```

### Project Structure

```
electron-app/
├── src/
│   ├── main.ts              # Main process
│   ├── preload.ts           # Preload script (security bridge)
│   ├── renderer/
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── api/
│       ├── auth.ts
│       ├── app.ts
│       └── updates.ts
├── resources/               # App icons, images
├── scripts/
│   ├── build.js
│   ├── sign-app.js
│   └── notarize.js
├── electron-builder.json    # Build config
├── webpack.main.config.js
├── webpack.preload.config.js
├── webpack.renderer.config.js
└── package.json
```

## 🔐 Security Architecture

### 1. Context Isolation & Preload Script

```typescript
// src/main.ts - Main Process
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // CRITICAL: Never disable these!
      sandbox: true,
      contextIsolation: true,
      enableRemoteModule: false,
      
      // Only expose through preload
      preload: path.join(__dirname, 'preload.js'),
      
      // Disable Node.js in renderer
      nodeIntegration: false,
      
      // Web security
      webSecurity: true,
    },
  });

  // Load app
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.on('ready', createWindow);

// Handle app closing
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

### 2. Preload Script (Security Bridge)

```typescript
// src/preload.ts - Runs in renderer but with elevated privileges
import { contextBridge, ipcRenderer } from 'electron';

// Expose only necessary APIs to renderer process
contextBridge.exposeInMainWorld('api', {
  // Authentication
  login: (email: string, password: string) =>
    ipcRenderer.invoke('api:login', { email, password }),
  logout: () => ipcRenderer.invoke('api:logout'),
  
  // Data
  fetchData: (endpoint: string) =>
    ipcRenderer.invoke('api:fetch', { endpoint }),
  
  // Storage
  getStored: (key: string) =>
    ipcRenderer.invoke('storage:get', { key }),
  setStored: (key: string, value: any) =>
    ipcRenderer.invoke('storage:set', { key, value }),
  
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // Handle main process messages
  onUpdateAvailable: (callback: () => void) =>
    ipcRenderer.on('app:update-available', callback),
});

// Type safety for window.api
declare global {
  interface Window {
    api: {
      login: (email: string, password: string) => Promise<any>;
      logout: () => Promise<void>;
      fetchData: (endpoint: string) => Promise<any>;
      getStored: (key: string) => Promise<any>;
      setStored: (key: string, value: any) => Promise<void>;
      getVersion: () => Promise<string>;
      onUpdateAvailable: (callback: () => void) => void;
    };
  }
}
```

### 3. IPC Handlers (Main Process API)

```typescript
// src/main.ts - Add handlers
import { ipcMain } from 'electron';
import { AuthService } from './services/auth';
import { StorageService } from './services/storage';

// Authentication
ipcMain.handle('api:login', async (event, { email, password }) => {
  try {
    const result = await AuthService.login(email, password);
    // Store token securely
    await StorageService.setToken(result.token);
    return result;
  } catch (error) {
    throw new Error('Login failed');
  }
});

ipcMain.handle('api:logout', async () => {
  await StorageService.deleteToken();
});

// Data fetching
ipcMain.handle('api:fetch', async (event, { endpoint }) => {
  const token = await StorageService.getToken();
  const response = await fetch(`https://api.example.com${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
});

// Storage (uses secure storage)
ipcMain.handle('storage:get', async (event, { key }) => {
  return await StorageService.get(key);
});

ipcMain.handle('storage:set', async (event, { key, value }) => {
  return await StorageService.set(key, value);
});

// App info
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});
```

### 4. Secure Storage

```typescript
// src/services/storage.ts
import keytar from 'keytar';
import { app } from 'electron';

export class StorageService {
  private static service = 'my-app';
  private static account = 'main';

  static async getToken(): Promise<string | null> {
    return await keytar.getPassword(this.service, 'auth-token');
  }

  static async setToken(token: string): Promise<void> {
    await keytar.setPassword(this.service, 'auth-token', token);
  }

  static async deleteToken(): Promise<void> {
    await keytar.deletePassword(this.service, 'auth-token');
  }

  // Generic secure storage
  static async get(key: string): Promise<any> {
    const value = await keytar.getPassword(this.service, key);
    return value ? JSON.parse(value) : null;
  }

  static async set(key: string, value: any): Promise<void> {
    await keytar.setPassword(this.service, key, JSON.stringify(value));
  }
}
```

## 🎨 React Component Example

```typescript
// src/renderer/pages/LoginPage.tsx
import React, { useState } from 'react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await window.api.login(email, password);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
```

## 📦 Build Configuration

### electron-builder.json

```json
{
  "appId": "com.example.myapp",
  "productName": "My App",
  "files": [
    "dist/**/*",
    "node_modules/**/*"
  ],
  "directories": {
    "buildResources": "resources"
  },
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64", "ia32"]
      },
      {
        "target": "portable",
        "arch": ["x64"]
      },
      {
        "target": "msi",
        "arch": ["x64"]
      }
    ],
    "certificateFile": "${env.WIN_SIGNING_CERT}",
    "certificatePassword": "${env.WIN_SIGNING_PASSWORD}",
    "signingHashAlgorithms": ["sha256"],
    "sign": "./scripts/sign.js"
  },
  "mac": {
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      },
      {
        "target": "zip",
        "arch": ["x64", "arm64"]
      }
    ],
    "category": "public.app-category.productivity",
    "hardenedRuntime": true,
    "gatekeeperAssess": false
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "My App"
  }
}
```

## 🔏 Code Signing (Windows)

```javascript
// scripts/sign.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = async (configuration) => {
  const { path: filePath } = configuration;
  
  const certPath = process.env.WIN_SIGNING_CERT;
  const certPassword = process.env.WIN_SIGNING_PASSWORD;
  const timestampServer = 'http://timestamp.comodoca.com';

  if (!fs.existsSync(certPath)) {
    throw new Error(`Certificate not found: ${certPath}`);
  }

  console.log(`Signing: ${filePath}`);

  try {
    execSync(
      `"C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.22621.0\\x64\\signtool.exe" ` +
      `sign /f "${certPath}" /p "${certPassword}" /t "${timestampServer}" /fd sha256 "${filePath}"`,
      { stdio: 'inherit' }
    );
    console.log(`✓ Successfully signed: ${filePath}`);
  } catch (error) {
    throw new Error(`Failed to sign: ${error.message}`);
  }
};
```

## 🚀 Auto-Updates

```typescript
// src/main.ts
import { autoUpdater } from 'electron-updater';

function setupAutoUpdates() {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    console.log('Update available');
    mainWindow?.webContents.send('app:update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded');
    // Install on app quit
    autoUpdater.quitAndInstall();
  });

  // Check every hour
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 60 * 60 * 1000);
}

app.on('ready', () => {
  createWindow();
  setupAutoUpdates();
});
```

## 📋 Build & Release Commands

```bash
# Development
npm start

# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for all platforms
npm run build:all

# Package executable
npm run pack

# Publish to GitHub Releases
npm run publish
```

### package.json Scripts

```json
{
  "scripts": {
    "start": "electron-vite preview",
    "dev": "electron-vite",
    "build": "electron-vite build",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:all": "electron-builder -mwl",
    "pack": "electron-builder --dir",
    "publish": "electron-builder --publish always"
  }
}
```

## 🔒 Security Checklist

- [ ] Context Isolation enabled
- [ ] Preload script used (no direct Node access)
- [ ] IPC validation on all handlers
- [ ] Secure storage for credentials
- [ ] Code signed with certificate
- [ ] HTTPS only for API calls
- [ ] Sandboxing enabled
- [ ] No remote code execution
- [ ] No eval() or dynamic requires
- [ ] CSP headers set

## 📋 Distribution

### Windows Installer
- NSIS (.exe installer)
- Portable (.exe single file)
- MSI (.msi installer)

### Microsoft Store
```
1. Enroll in Partner Center ($19/year)
2. Create app listing
3. Upload signed .msix package
4. Fill screenshots & description
5. Set pricing
6. Submit for review
```

## 🔗 Resources

- Electron Docs: https://www.electronjs.org/docs
- electron-builder: https://www.electron.build
- electron-updater: https://github.com/electron-userland/electron-builder
- Security: https://www.electronjs.org/docs/tutorial/security
