/******/ (function() { // webpackBootstrap
var __webpack_exports__ = {};
// Writr Settings UI Enhancement
document.addEventListener('DOMContentLoaded', function () {
  // Settings validation
  var validateSettings = function validateSettings(settings) {
    var errors = [];

    // Validate editor settings
    if (settings.editor.min_height && settings.editor.max_height) {
      if (settings.editor.min_height >= settings.editor.max_height) {
        errors.push('Maximum height must be greater than minimum height');
      }
    }

    // Validate header levels
    if (settings.tools.header && settings.tools.header.enabled) {
      var levels = settings.tools.header.config.levels;
      var defaultLevel = settings.tools.header.config.defaultLevel;
      if (!levels.includes(defaultLevel)) {
        errors.push('Default header level must be one of the available levels');
      }
    }

    // Validate auto-save interval
    if (settings.features.autoSave.enabled && settings.features.autoSave.interval < 5000) {
      errors.push('Auto-save interval must be at least 5 seconds');
    }
    return errors;
  };

  // Live preview functionality
  var updatePreview = function updatePreview() {
    // If there's an editor instance on the page, update its configuration
    if (window.currentEditor && typeof window.settingsApp !== 'undefined') {
      try {
        var settings = window.settingsApp().settings;
        console.log('Updating editor preview with settings:', settings);

        // Note: Full reinitalization would be needed for complete preview
        // This is a simplified version for demonstration
      } catch (error) {
        console.warn('Could not update editor preview:', error);
      }
    }
  };

  // Debounce function for live updates
  var debounce = function debounce(func, wait) {
    var timeout;
    return function executedFunction() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var later = function later() {
        clearTimeout(timeout);
        func.apply(void 0, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Set up live preview updates (debounced)
  var debouncedPreview = debounce(updatePreview, 500);

  // If settings page is available, add change listeners
  if (typeof window.settingsApp !== 'undefined') {
    // Add change listeners to form elements
    document.addEventListener('input', debouncedPreview);
    document.addEventListener('change', debouncedPreview);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + S to save settings
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (typeof window.settingsApp !== 'undefined') {
        var app = window.settingsApp();
        if (app.saveSettings) {
          app.saveSettings();
        }
      }
    }

    // Ctrl/Cmd + R to reset settings (with confirmation)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.shiftKey) {
      e.preventDefault();
      if (typeof window.settingsApp !== 'undefined') {
        var _app = window.settingsApp();
        if (_app.resetSettings && confirm('Reset all settings to defaults?')) {
          _app.resetSettings();
        }
      }
    }
  });
  console.log('Writr Settings UI enhancements loaded');
});
var __webpack_export_target__ = window;
for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;