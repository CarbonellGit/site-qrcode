export class CameraService {
    constructor(elementId) {
        this.elementId = elementId;
        this.scannerInstance = null;
        this._visibilityBound = false;
        this._pausedByVisibility = false;
    }

    /**
     * Inicializa a instância do Html5Qrcode caso ainda não tenha sido criada.
     */
    init() {
        if (!this.scannerInstance && window.Html5Qrcode) {
            this.scannerInstance = new window.Html5Qrcode(this.elementId);
            this._bindVisibilityListener();
        }
    }

    /**
     * Vincula o ouvinte de visibilidade da página para gerenciar o estado da câmera em segundo plano.
     */
    _bindVisibilityListener() {
        if (this._visibilityBound) return;
        this._visibilityBound = true;

        document.addEventListener('visibilitychange', () => {
            if (!this.scannerInstance) return;

            if (document.visibilityState === 'hidden') {
                // Estado interno do html5-qrcode 2 = SCANNING (Escaneando)
                if (this.scannerInstance.getState() === 2) {
                    this.pauseCamera();
                    this._pausedByVisibility = true; // Flag para indicar que pausamos automaticamente
                }
            } else if (document.visibilityState === 'visible') {
                // Estado interno do html5-qrcode 3 = PAUSED (Pausado)
                // Apenas retoma automaticamente se foi pausado pela API de visibilidade
                if (this.scannerInstance.getState() === 3 && this._pausedByVisibility) {
                    this.resumeCamera();
                    this._pausedByVisibility = false; 
                }
            }
        });
    }

    /**
     * Inicia a câmera com a configuração informada.
     * @param {Object} config - Configuração de escaneamento do QR Code
     * @param {Function} onDetect - Callback executado em caso de sucesso na detecção
     * @param {Function} onError - Callback executado em caso de erro na detecção (transiente)
     */
    async startCamera(config, onDetect, onError) {
        this.init();
        if (!this.scannerInstance) {
            throw new Error("Html5Qrcode library not loaded.");
        }

        try {
            await this.scannerInstance.start(
                { facingMode: "environment" }, // Preferir a câmera traseira
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
     * Pausa o stream ativo da câmera.
     */
    pauseCamera() {
        if (this.scannerInstance && this.scannerInstance.getState() === 2) { // 2 = SCANNING
            this.scannerInstance.pause();
        }
    }

    /**
     * Retoma o stream pausado da câmera.
     */
    resumeCamera() {
        if (this.scannerInstance && this.scannerInstance.getState() === 3) { // 3 = PAUSED
            // Garantir que a flag seja limpa manualmente se retomado explicitamente pelo usuário/sistema
            this._pausedByVisibility = false; 
            this.scannerInstance.resume();
        }
    }

    /**
     * Para a câmera e limpa a instância.
     */
    async stopCamera() {
        if (this.scannerInstance && this.scannerInstance.isScanning) {
            await this.scannerInstance.stop();
            this.scannerInstance.clear();
        }
    }
}
