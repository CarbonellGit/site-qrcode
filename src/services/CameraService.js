export class CameraService {
    constructor(elementId) {
        this.elementId = elementId;
        this.scannerInstance = null;
        this._visibilityBound = false;
        this._pausedByVisibility = false;
    }

    /**
     * Initializes the Html5Qrcode instance if not already created.
     */
    init() {
        if (!this.scannerInstance && window.Html5Qrcode) {
            this.scannerInstance = new window.Html5Qrcode(this.elementId);
            this._bindVisibilityListener();
        }
    }

    /**
     * Binds the page visibility listener to manage background camera state.
     */
    _bindVisibilityListener() {
        if (this._visibilityBound) return;
        this._visibilityBound = true;

        document.addEventListener('visibilitychange', () => {
            if (!this.scannerInstance) return;

            if (document.visibilityState === 'hidden') {
                // html5-qrcode internal state 2 = SCANNING
                if (this.scannerInstance.getState() === 2) {
                    this.pauseCamera();
                    this._pausedByVisibility = true; // Flag to indicate we auto-paused it
                }
            } else if (document.visibilityState === 'visible') {
                // html5-qrcode internal state 3 = PAUSED
                // Only auto-resume if it was paused BY the visibility API
                if (this.scannerInstance.getState() === 3 && this._pausedByVisibility) {
                    this.resumeCamera();
                    this._pausedByVisibility = false; 
                }
            }
        });
    }

    /**
     * Starts the camera with the given configuration.
     * @param {Object} config - QR Code scanning configuration
     * @param {Function} onDetect - Callback on successful detection
     * @param {Function} onError - Callback on detection error (transient)
     */
    async startCamera(config, onDetect, onError) {
        this.init();
        if (!this.scannerInstance) {
            throw new Error("Html5Qrcode library not loaded.");
        }

        try {
            await this.scannerInstance.start(
                { facingMode: "environment" }, // Prefer back camera
                config,
                onDetect,
                onError
            );
            return true;
        } catch (error) {
            console.error(`[CameraService] Failed to start camera stream:`, {
                timestamp: new Date().toISOString(),
                configUsed: config,
                errorContext: error
            });
            throw error;
        }
    }

    /**
     * Pauses the active camera stream.
     */
    pauseCamera() {
        if (this.scannerInstance && this.scannerInstance.getState() === 2) { // 2 = SCANNING
            this.scannerInstance.pause();
        }
    }

    /**
     * Resumes the paused camera stream.
     */
    resumeCamera() {
        if (this.scannerInstance && this.scannerInstance.getState() === 3) { // 3 = PAUSED
            // Ensure we clear the flag manually if resumed explicitly by the user/system
            this._pausedByVisibility = false; 
            this.scannerInstance.resume();
        }
    }

    /**
     * Stops the camera and clears the instance.
     */
    async stopCamera() {
        if (this.scannerInstance && this.scannerInstance.isScanning) {
            await this.scannerInstance.stop();
            this.scannerInstance.clear();
        }
    }
}
