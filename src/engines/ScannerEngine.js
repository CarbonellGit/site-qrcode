export class ScannerEngine {
    constructor(cameraService, uiHandler) {
        this.cameraService = cameraService;
        this.uiHandler = uiHandler;
        this.isProcessing = false;
    }

    /**
     * Generates responsive configuration based on viewport width.
     */
    getScannerConfig() {
        const qrBoxSize = window.innerWidth < 768 ? 250 : 400;
        return {
            fps: 10,
            qrbox: { width: qrBoxSize, height: qrBoxSize },
            aspectRatio: 1.0,
            disableFlip: false // Allow scanning mirrored codes
        };
    }

    /**
     * Validates if the scanned text is a valid URL using Regex.
     * @param {string} text
     * @returns {boolean}
     */
    isValidUrl(text) {
        try {
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
            return !!urlPattern.test(text);
        } catch (_) {
            return false;
        }
    }

    /**
     * Main entry point to start the scanning engine.
     */
    async start() {
        this.uiHandler.setState('loading');
        try {
            const config = this.getScannerConfig();
            
            await this.cameraService.startCamera(
                config,
                (decodedText) => this.handleDetection(decodedText),
                (error) => {
                    // Ignore transient frame matching errors
                    // console.warn('QR Code parsing frame error', error);
                }
            );

            this.uiHandler.setState('active');
        } catch (error) {
            this.uiHandler.setState('error', 'Acesso à câmera negado ou dispositivo indisponível.');
        }
    }

    /**
     * Handles the successful detection of a QR Code.
     * @param {string} decodedText
     */
    handleDetection(decodedText) {
        // Debounce / prevent multiple rapid detections
        if (this.isProcessing) return;
        this.isProcessing = true;

        this.cameraService.pauseCamera();
        this.uiHandler.vibrateSuccess();
        this.uiHandler.setState('success');
        
        if (this.isValidUrl(decodedText)) {
            // Auto inject https:// if missing for secure redirect
            let redirectUrl = decodedText;
            if (!/^https?:\/\//i.test(decodedText)) {
                redirectUrl = 'https://' + decodedText;
            }
            
            this.uiHandler.updateStatus(`${redirectUrl}`, 'success');
            
            // Show action buttons for manual redirect to prevent phishing
            this.uiHandler.showUrlAction(
                redirectUrl,
                () => {
                    window.location.assign(redirectUrl);
                },
                () => {
                    this.isProcessing = false;
                    this.uiHandler.setState('active');
                    this.cameraService.resumeCamera();
                }
            );
        } else {
            // It's just text
            this.uiHandler.updateStatus(`${decodedText}`, 'default');
            
            // Resume scanning after a delay
            setTimeout(() => {
                this.isProcessing = false;
                this.uiHandler.setState('active');
                this.cameraService.resumeCamera();
            }, 3000);
        }
    }
}
