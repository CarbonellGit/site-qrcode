import { CameraService } from './services/CameraService.js';
import { ScannerEngine } from './engines/ScannerEngine.js';
import { UIHandler } from './handlers/UIHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    // Retry button setup
    const retryBtn = document.getElementById('retry-btn');
    
    /**
     * Initialization routine. 
     * Runs when the HTML payload is ready and the external scanning library is loaded.
     */
    const initApplication = () => {
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

    /**
     * Boots up the system only when dependencies are fully available.
     * Prevents continuous DOM polling.
     */
    const bootstrap = () => {
        if (typeof window.Html5Qrcode !== 'undefined') {
            initApplication();
        } else {
            window.addEventListener('scannerLibraryLoaded', initApplication, { once: true });
        }
    };

    // Kick-off
    bootstrap();
});
