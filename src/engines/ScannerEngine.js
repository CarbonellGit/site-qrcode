export class ScannerEngine {
    constructor(cameraService, uiHandler) {
        this.cameraService = cameraService;
        this.uiHandler = uiHandler;
        this.isProcessing = false;
    }

    /**
     * Gera configuração responsiva com base na largura da janela.
     */
    getScannerConfig() {
        const qrBoxSize = window.innerWidth < 768 ? 250 : 400;
        return {
            fps: 10,
            qrbox: { width: qrBoxSize, height: qrBoxSize },
            aspectRatio: 1.0,
            disableFlip: false // Permitir escaneamento de códigos espelhados
        };
    }

    /**
     * Valida se o texto escaneado é uma URL válida usando a API nativa de URL.
     * @param {string} text
     * @returns {boolean}
     */
    isValidUrl(text) {
        try {
            // Assume http:// se nenhum protocolo for fornecido, para permitir que o parser de URL valide a estrutura do domínio.
            const urlToTest = /^https?:\/\//i.test(text) ? text : `http://${text}`;
            const parsedUrl = new URL(urlToTest);
            
            // Garante também que possui um nome de host de rede válido (deve conter um ponto para TLDs neste contexto genérico)
            if (!parsedUrl.hostname.includes('.')) {
                return false;
            }

            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Ponto de entrada principal para iniciar o motor de escaneamento.
     */
    async start() {
        this.uiHandler.setState('loading');
        try {
            const config = this.getScannerConfig();
            
            await this.cameraService.startCamera(
                config,
                (decodedText) => this.handleDetection(decodedText),
                (error) => {
                    // Registrar erros transientes de leitura de frames de forma estruturada, sem quebrar a UI
                    console.warn(`[ScannerEngine] Erro de detecção transiente:`, {
                        timestamp: new Date().toISOString(),
                        errorContext: error,
                        action: 'Ignorado de forma transparente para evitar quebra da UI'
                    });
                }
            );

            this.uiHandler.setState('active');
        } catch (error) {
            console.error(`[ScannerEngine] Erro fatal na inicialização da câmera:`, {
                timestamp: new Date().toISOString(),
                errorContext: error,
                action: 'Exibindo estado de erro na UI'
            });
            this.uiHandler.setState('error', 'Acesso à câmera negado ou dispositivo indisponível.');
        }
    }

    /**
     * Lida com a detecção bem-sucedida de um QR Code.
     * @param {string} decodedText
     */
    handleDetection(decodedText) {
        // Debounce / previne múltiplas detecções rápidas repetidas
        if (this.isProcessing) return;
        this.isProcessing = true;

        this.cameraService.pauseCamera();
        this.uiHandler.vibrateSuccess();
        this.uiHandler.setState('success');
        
        if (this.isValidUrl(decodedText)) {
            // Injeta https:// automaticamente se estiver faltando para um redirecionamento seguro
            let redirectUrl = decodedText;
            if (!/^https?:\/\//i.test(decodedText)) {
                redirectUrl = 'https://' + decodedText;
            }
            
            this.uiHandler.updateStatus(`${redirectUrl}`, 'success');
            
            // Abre o link automaticamente em uma nova aba do navegador
            window.open(redirectUrl, '_blank', 'noopener,noreferrer');

            // Retoma o escaneamento após um intervalo para permitir novas leituras
            setTimeout(() => {
                this.isProcessing = false;
                this.uiHandler.setState('active');
                this.cameraService.resumeCamera();
            }, 3000);
        } else {
            // É apenas texto
            this.uiHandler.updateStatus(`${decodedText}`, 'default');
            
            // Retoma o escaneamento após um atraso
            setTimeout(() => {
                this.isProcessing = false;
                this.uiHandler.setState('active');
                this.cameraService.resumeCamera();
            }, 3000);
        }
    }
}
