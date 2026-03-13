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
     * Validates if the scanned text is a valid URL using the native URL API.
     * @param {string} text
     * @returns {boolean}
     */
    isValidUrl(text) {
        try {
            // Assume http:// if no protocol is given, to let the URL parser validate the domain structure.
            const urlToTest = /^https?:\/\//i.test(text) ? text : `http://${text}`;
            const parsedUrl = new URL(urlToTest);
            
            // Further ensure it has a valid network hostname (must contain a dot for TLDs in this generic context)
            if (!parsedUrl.hostname.includes('.')) {
                return false;
            }

            return true;
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
                    // Log transient frame matching errors structurally without breaking UI
                    console.warn(`[ScannerEngine] Transient detection error:`, {
                        timestamp: new Date().toISOString(),
                        errorContext: error,
                        action: 'Ignored transparently to avoid UI breaking'
                    });
                }
            );

            this.uiHandler.setState('active');
        } catch (error) {
            console.error(`[ScannerEngine] Fatal camera startup error:`, {
                timestamp: new Date().toISOString(),
                errorContext: error,
                action: 'Displaying error state on UI'
            });
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
