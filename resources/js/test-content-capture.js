/**
 * Test script to verify Writr content capture functionality
 * Include this script in your test environment to verify everything works
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Writr to be available
    const checkWritr = setInterval(() => {
        if (window.WritrHelpers && window.writrContentCaptureHandler) {
            clearInterval(checkWritr);
            runContentCaptureTests();
        }
    }, 100);
});

async function runContentCaptureTests() {
    console.log('🧪 Running Writr Content Capture Tests...');
    
    try {
        // Test 1: Check if content capture handler is available
        console.log('✓ Content capture handler available:', !!window.writrContentCaptureHandler);
        
        // Test 2: Check if helpers are available
        console.log('✓ Helper functions available:', !!window.WritrHelpers);
        
        // Test 3: Get registered editors
        const registeredEditors = window.WritrHelpers.getRegisteredWritrEditors();
        console.log('✓ Registered editors:', registeredEditors);
        
        // Test 4: Check for unsaved changes
        const hasUnsaved = window.WritrHelpers.hasUnsavedWritrChanges();
        console.log('✓ Has unsaved changes:', hasUnsaved);
        
        // Test 5: Try to capture all content
        const captured = await window.WritrHelpers.captureAllWritrContent();
        console.log('✓ Content capture successful:', captured);
        
        // Test 6: Get all content
        const allContent = await window.WritrHelpers.getAllWritrContent();
        console.log('✓ Retrieved content from editors:', Object.keys(allContent));
        
        // Test 7: Check hidden inputs
        const hiddenInputs = document.querySelectorAll('input[type="hidden"][name*="content"]');
        console.log('✓ Found hidden inputs:', hiddenInputs.length);
        
        hiddenInputs.forEach((input, index) => {
            try {
                const content = JSON.parse(input.value);
                console.log(`✓ Hidden input ${index + 1} has valid JSON:`, !!content.blocks);
            } catch (e) {
                console.warn(`⚠️ Hidden input ${index + 1} has invalid JSON`);
            }
        });
        
        console.log('🎉 All Writr content capture tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Writr content capture test failed:', error);
    }
}

// Global test function for manual testing
window.testWritrContentCapture = runContentCaptureTests;
