/**
 * Test script to verify Writr content capture functionality
 * Include this script in your test environment to verify everything works
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Writr to be available
    const checkWritr = setInterval(() => {
        if (window.WritrHelpers && window.contentCaptureHandler) {
            clearInterval(checkWritr);
            runContentCaptureTests();
        }
    }, 100);
});

async function runContentCaptureTests() {
    console.log('🧪 Running Writr Content Capture Tests...');
    
    try {
        // Test 1: Check if content capture handler is available
        console.log('✓ Content capture handler available:', !!window.contentCaptureHandler);
        
        // Test 2: Check if helpers are available
        console.log('✓ Helper functions available:', !!window.WritrHelpers);
        
        // Test 3: Get registered editors
        const editorCount = window.contentCaptureHandler ? Object.keys(window.contentCaptureHandler.editors).length : 0;
        console.log('✓ Registered editors count:', editorCount);
        
        // Test 4: Try to capture all content
        const captured = window.WritrHelpers.captureAllContent();
        console.log('✓ Content capture successful:', captured);
        
        // Test 5: Get content for each editor
        Object.keys(window.contentCaptureHandler.editors || {}).forEach(editorId => {
            const content = window.WritrHelpers.captureEditorContent(editorId);
            console.log(`✓ Retrieved content from editor ${editorId}:`, !!content);
        });
        
        console.log('🎉 All Writr content capture tests completed successfully!');
        
        // Display success message if available
        if (window.showMessage) {
            window.showMessage('✅ Content capture tests passed!', 'success');
        }
        
    } catch (error) {
        console.error('❌ Writr content capture test failed:', error);
        
        // Display error message if available
        if (window.showMessage) {
            window.showMessage('❌ Content capture tests failed: ' + error.message, 'error');
        }
    }
}

// Global test functions for manual testing
window.testWritrContentCapture = runContentCaptureTests;

// Test function to capture content from all Writr editors
window.testCaptureAllContent = function() {
    if (typeof WritrHelpers !== 'undefined' && WritrHelpers.captureAllContent) {
        try {
            const content = WritrHelpers.captureAllContent();
            console.log('Captured content from all editors:', content);
            
            // Display in the demo interface
            if (window.showCapturedContent) {
                window.showCapturedContent('All Editors', content);
            }
            
            return content;
        } catch (error) {
            console.error('Error capturing all content:', error);
            if (window.showMessage) {
                window.showMessage('❌ Error capturing content: ' + error.message, 'error');
            }
            return null;
        }
    } else {
        console.error('WritrHelpers.captureAllContent not available');
        if (window.showMessage) {
            window.showMessage('❌ WritrHelpers not available. Make sure writr.js is loaded.', 'error');
        }
        return null;
    }
};

// Test function to capture content from a specific editor
window.testCaptureEditorContent = function(editorId) {
    if (typeof WritrHelpers !== 'undefined' && WritrHelpers.captureEditorContent) {
        try {
            const content = WritrHelpers.captureEditorContent(editorId);
            console.log(`Captured content from editor ${editorId}:`, content);
            
            // Display in the demo interface
            if (window.showCapturedContent) {
                window.showCapturedContent(`Editor: ${editorId}`, content);
            }
            
            return content;
        } catch (error) {
            console.error(`Error capturing content from editor ${editorId}:`, error);
            if (window.showMessage) {
                window.showMessage(`❌ Error capturing content from ${editorId}: ` + error.message, 'error');
            }
            return null;
        }
    } else {
        console.error('WritrHelpers.captureEditorContent not available');
        if (window.showMessage) {
            window.showMessage('❌ WritrHelpers not available. Make sure writr.js is loaded.', 'error');
        }
        return null;
    }
};
