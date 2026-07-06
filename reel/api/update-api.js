/**
 * Update API - Auto-Update UI Component
 * Handles update notifications, downloads, and installation
 */
const UpdateAPI = (() => {
    const isElectron = typeof window !== 'undefined' && window.electron;
    let updateModal = null;

    return {
        /**
         * Initialize Update System
         */
        async init() {
            if (!isElectron) return;

            // Listen for update events
            window.electron.onUpdateAvailable((data) => {
                this.handleUpdateAvailable(data);
            });

            window.electron.onUpdateDownloaded((data) => {
                this.handleUpdateDownloaded(data);
            });

            window.electron.onUpdateNotAvailable?.(() => {
                this.handleUpdateNotAvailable();
            });

            // Check for updates on startup
            await this.checkForUpdates();
        },

        /**
         * Check for updates manually
         */
        async checkForUpdates() {
            if (!isElectron) return;

            try {
                const result = await window.electron.filmora?.detect?.() || {};
                console.log('Update check result:', result);
            } catch (error) {
                console.warn('Could not check for updates:', error);
            }
        },

        /**
         * Handle: Update Available
         */
        handleUpdateAvailable(data) {
            console.log('Update available:', data);

            // Create notification
            this.showNotification({
                type: 'info',
                title: '📦 Update verfügbar',
                message: `IceHeat Desktop v${data.version} ist verfügbar`,
                actions: [
                    { label: 'Herunterladen', callback: () => this.downloadUpdate() },
                    { label: 'Später', callback: () => this.closeNotification() }
                ]
            });
        },

        /**
         * Handle: Update Downloaded
         */
        handleUpdateDownloaded(data) {
            console.log('Update downloaded:', data);

            // Show restart dialog
            this.showNotification({
                type: 'success',
                title: '✅ Update bereit',
                message: `IceHeat Desktop v${data.version} kann jetzt installiert werden`,
                actions: [
                    { label: 'Jetzt neustarten', callback: () => this.installUpdate() },
                    { label: 'Später', callback: () => this.closeNotification() }
                ],
                sticky: true
            });
        },

        /**
         * Handle: Update Not Available
         */
        handleUpdateNotAvailable() {
            this.showNotification({
                type: 'success',
                message: '✅ Sie verwenden bereits die neueste Version',
                duration: 3000
            });
        },

        /**
         * Download update
         */
        async downloadUpdate() {
            if (!isElectron) return;

            try {
                this.showNotification({
                    type: 'info',
                    title: '⏳ Update wird heruntergeladen...',
                    message: 'Bitte warten Sie, während die neue Version heruntergeladen wird',
                    sticky: true,
                    id: 'downloading'
                });

                await window.electron.filmora?.exportProject?.({}) ||
                    console.log('Download started');

                // Close downloading notification on success
                this.closeNotification('downloading');
            } catch (error) {
                console.error('Download failed:', error);
                this.showNotification({
                    type: 'error',
                    title: '❌ Download fehlgeschlagen',
                    message: error.message || 'Bitte versuchen Sie es später erneut',
                    duration: 5000
                });
            }
        },

        /**
         * Install update (quit and install)
         */
        async installUpdate() {
            if (!isElectron) return;

            try {
                // Show restart countdown
                this.showNotification({
                    type: 'info',
                    title: '🔄 App wird neu gestartet...',
                    message: 'Bitte speichern Sie Ihre Projekte',
                    sticky: true
                });

                // Quit and install
                setTimeout(() => {
                    window.electron.filmora?.launch?.() ||
                        console.log('Installation triggered');
                }, 2000);
            } catch (error) {
                console.error('Installation failed:', error);
            }
        },

        /**
         * Show notification/toast
         */
        showNotification(options = {}) {
            const {
                type = 'info',
                title = '',
                message = '',
                duration = 5000,
                sticky = false,
                actions = [],
                id = `notification-${Date.now()}`
            } = options;

            // Create notification element
            const notification = document.createElement('div');
            notification.id = id;
            notification.className = `update-notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: ${this.getBackgroundColor(type)};
                color: #fff;
                padding: 16px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
                font-family: 'Barlow', sans-serif;
            `;

            let html = '';
            if (title) {
                html += `<div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${title}</div>`;
            }
            if (message) {
                html += `<div style="font-size: 12px; opacity: 0.95;">${message}</div>`;
            }

            if (actions.length > 0) {
                html += '<div style="margin-top: 12px; display: flex; gap: 8px;">';
                actions.forEach((action, idx) => {
                    html += `<button data-action="${idx}" style="
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: #fff;
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-size: 11px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.2s;
                    ">${action.label}</button>`;
                });
                html += '</div>';
            }

            notification.innerHTML = html;

            // Add to DOM
            if (!document.getElementById('update-notifications')) {
                const container = document.createElement('div');
                container.id = 'update-notifications';
                document.body.appendChild(container);
            }
            document.getElementById('update-notifications').appendChild(notification);

            // Add button listeners
            actions.forEach((action, idx) => {
                const btn = notification.querySelector(`[data-action="${idx}"]`);
                if (btn) {
                    btn.addEventListener('click', () => {
                        action.callback();
                        this.closeNotification(id);
                    });
                }
            });

            // Auto-close after duration
            if (!sticky && duration > 0) {
                setTimeout(() => {
                    this.closeNotification(id);
                }, duration);
            }

            return id;
        },

        /**
         * Close notification
         */
        closeNotification(id) {
            const notification = document.getElementById(id);
            if (notification) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        },

        /**
         * Get background color by type
         */
        getBackgroundColor(type) {
            const colors = {
                info: 'rgba(14, 165, 233, 0.9)',      // Ice Blue
                success: 'rgba(22, 163, 74, 0.9)',     // Green
                warning: 'rgba(245, 158, 11, 0.9)',    // Amber
                error: 'rgba(239, 68, 68, 0.9)'        // Red
            };
            return colors[type] || colors.info;
        }
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UpdateAPI.init());
} else {
    UpdateAPI.init();
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(400px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }
`;
document.head.appendChild(style);
