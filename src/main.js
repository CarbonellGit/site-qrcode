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

        // Iniciar no estado "start" aguardando ação do usuário
        uiHandler.setState('start');
        
        const startBtn = document.getElementById('start-scanner-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                scannerEngine.start();
            });
        }

        // Vincular botão de tentar novamente
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                scannerEngine.start();
            });
        }
    };

    /**
     * Inicializa o sistema apenas quando as dependências estão totalmente disponíveis.
     * Previne a verificação contínua do DOM (polling).
     */
    const bootstrap = () => {
        if (typeof window.Html5Qrcode !== 'undefined') {
            initApplication();
        } else {
            window.addEventListener('scannerLibraryLoaded', initApplication, { once: true });
        }
    };

    // Ponto de partida
    bootstrap();
});
