export class CameraService {
    constructor(elementId) {
        this.elementId = elementId;
        this.scannerInstance = null;
    }

    /**
     * Initializes the Html5Qrcode instance if not already created.
     */
    init() {
        if (!this.scannerInstance && window.Html5Qrcode) {
            this.scannerInstance = new window.Html5Qrcode(this.elementId);
        }
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
            console.error("Camera startup error:", error);
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
