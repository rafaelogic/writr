/**
 * Theme utility for Writr Editor
 * Handles dark/light theme switching and system detection
 */

export class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.callbacks = new Set();
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (this.getStoredTheme() === null) {
                    this.setTheme(e.matches ? 'dark' : 'light', false);
                }
            });
        }
    }

    /**
     * Get the current theme
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Set the theme
     * @param {string} theme - 'light', 'dark', or 'auto'
     * @param {boolean} store - Whether to store the preference
     */
    setTheme(theme, store = true) {
        if (theme === 'auto') {
            theme = this.getSystemTheme();
            if (store) {
                localStorage.removeItem('writr-theme');
            }
        } else if (store) {
            localStorage.setItem('writr-theme', theme);
        }

        this.currentTheme = theme;
        this.applyTheme(theme);
        this.notifyCallbacks(theme);
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Apply theme to the document
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
    }

    /**
     * Get system preferred theme
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Get stored theme preference
     */
    getStoredTheme() {
        return localStorage.getItem('writr-theme');
    }

    /**
     * Subscribe to theme changes
     * @param {Function} callback - Function to call when theme changes
     */
    subscribe(callback) {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }

    /**
     * Notify all subscribers of theme change
     */
    notifyCallbacks(theme) {
        this.callbacks.forEach(callback => callback(theme));
    }

    /**
     * Initialize theme on page load
     */
    init() {
        this.applyTheme(this.currentTheme);
    }
}

// Create global instance
const themeManager = new ThemeManager();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => themeManager.init());
} else {
    themeManager.init();
}

// Export for use in other modules
export default themeManager;