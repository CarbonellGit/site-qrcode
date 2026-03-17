import { CameraService } from './services/CameraService.js';
import { ScannerEngine } from './engines/ScannerEngine.js';
import { UIHandler } from './handlers/UIHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    // Configuração do botão de tentar novamente
    const retryBtn = document.getElementById('retry-btn');
    
    /**
     * Rotina de inicialização. 
     * Executa quando o HTML está pronto e a biblioteca externa de scanner foi carregada.
     */
    const initApplication = () => {
        const uiHandler = new UIHandler();
        const cameraService = new CameraService('reader');
        const scannerEngine = new ScannerEngine(cameraService, uiHandler);

        // Iniciar escaneamento
        scannerEngine.start();

        // Vincular botão de tentar novamente
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                scannerEngine.start();
            });
        }
    };

    /**
     * Inicializa o sistema apenas quando as dependências estão totalmente disponíveis.
     * Usa evento customizado com fallback de polling para evitar race conditions.
     */
    const bootstrap = () => {
        // Flag para prevenir inicialização dupla
        let initialized = false;

        const safeInit = () => {
            if (!initialized && typeof window.Html5Qrcode !== 'undefined') {
                initialized = true;
                initApplication();
            }
        };

        // Caminho rápido: biblioteca já carregou
        if (typeof window.Html5Qrcode !== 'undefined') {
            initApplication();
            return;
        }

        // Registra listener para o evento customizado
        window.addEventListener('scannerLibraryLoaded', safeInit, { once: true });

        // Fallback: polling de curta duração caso o evento já tenha disparado
        let attempts = 0;
        const maxAttempts = 50; // 50 × 100ms = 5 segundos máximo
        const checkLibrary = setInterval(() => {
            attempts++;
            if (typeof window.Html5Qrcode !== 'undefined') {
                clearInterval(checkLibrary);
                safeInit();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkLibrary);
                console.error('[Bootstrap] Biblioteca html5-qrcode não carregou após 5s.');
            }
        }, 100);
    };

    // Ponto de partida
    bootstrap();
});
