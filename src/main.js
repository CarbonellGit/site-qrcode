import { CameraService } from './services/CameraService.js';
import { ScannerEngine } from './engines/ScannerEngine.js';
import { UIHandler } from './handlers/UIHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    // Retry button setup
    const retryBtn = document.getElementById('retry-btn');
    
    /**
     * Initialization routine. Waits recursively for html5-qrcode
     * to become available globally.
     */
    const initApplication = () => {
        if (typeof window.Html5Qrcode === 'undefined') {
            // Wait 100ms and check again if CDN isn't parsed yet
            setTimeout(initApplication, 100);
            return;
        }

        const uiHandler = new UIHandler();
        const cameraService = new CameraService('reader');
        const scannerEngine = new ScannerEngine(cameraService, uiHandler);

        // Start scanning
        scannerEngine.start();

        // Bind retry button
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                scannerEngine.start();
            });
        }
    };

    // Kick-off
    initApplication();
});
