/**
 * Writr Bundle - Standalone version for use without Laravel Mix
 * This file exports the WritrEditor class for standalone usage
 */

import { WritrEditor } from './writr.js';

// Export as default for UMD bundle
export default WritrEditor;

// Also export named export for ES modules
export { WritrEditor };

// Make it available globally when loaded as UMD
if (typeof window !== 'undefined') {
    window.WritrEditor = WritrEditor;
    window.Writr = WritrEditor;
}
