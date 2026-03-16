export class UIHandler {
    constructor() {
        this.wrapper = document.getElementById('reader-wrapper');
        this.resultText = document.getElementById('result-text');
        this.statusBadge = document.getElementById('status-badge');
        this.errorText = document.querySelector('.error-text');

        // UI de prevenção contra phishing
        this.actionContainer = document.getElementById('action-container');
        this.accessLinkBtn = document.getElementById('access-link-btn');
        this.resumeScanBtn = document.getElementById('resume-scan-btn');
    }

    /**
     * Define o estado visual da interface de usuário do scanner.
     * @param {'loading' | 'active' | 'success' | 'error'} state
     * @param {string} customErrorMessage - Texto de erro customizado opcional
     */
    setState(state, customErrorMessage = '') {
        // Redefine as classes de estado específicas no wrapper central
        this.wrapper.classList.remove('state-loading', 'state-active', 'state-success', 'state-error');
        this.wrapper.classList.add(`state-${state}`);
        
        // Oculta todas as camadas sobrepostas (overlays) estritamente via ARIA
        const overlays = document.querySelectorAll('.overlay');
        overlays.forEach(overlay => {
            overlay.setAttribute('aria-hidden', 'true');
        });

        // Oculta o contêiner de ação por padrão ao trocar de estados
        if (this.actionContainer) {
            this.actionContainer.classList.add('hidden');
            this.actionContainer.setAttribute('aria-hidden', 'true');
        }

        // Exibe a camada sobreposta alvo (target overlay) se ela existir
        const targetOverlay = document.querySelector(`.${state}-overlay`);
        if (targetOverlay) {
            targetOverlay.setAttribute('aria-hidden', 'false');
        }

        // Trata a lógica específica para cada estado
        switch (state) {
            case 'loading':
                this.updateStatus('Acessando câmera...', 'default');
                break;
            case 'active':
                this.updateStatus('Pronto para ler', 'default');
                break;
            case 'success':
                // Tratado principalmente pela ScannerEngine para um texto específico
                break;
            case 'error':
                if (customErrorMessage) {
                    this.errorText.textContent = customErrorMessage;
                }
                this.updateStatus('Erro no escaneamento', 'error');
                break;
        }
    }

    /**
     * Atualiza o texto e o significado semântico do emblema (badge) de status abaixo do scanner.
     * @param {string} message - Texto para mostrar
     * @param {'default' | 'success' | 'error'} type - Variante de estilo
     */
    updateStatus(message, type) {
        // [AVISO]: DIRETIVA DE SEGURANÇA
        // NÃO altere `textContent` para `innerHTML`.
        // A variável `message` pode conter dados arbitrários vindos do QR Code.
        // Usar `innerHTML` exporia a aplicação a ataques de XSS (Cross-Site Scripting).
        this.resultText.textContent = message;
        
        if (type === 'success') {
            this.statusBadge.textContent = 'Sucesso';
            this.statusBadge.className = 'badge success';
        } else if (type === 'error') {
            this.statusBadge.textContent = 'Atenção';
            this.statusBadge.className = 'badge error';
        } else {
            this.statusBadge.textContent = 'Status';
            this.statusBadge.className = 'badge';
        }
    }

    /**
     * Aciona a API de Vibração se for suportada pelo dispositivo.
     */
    vibrateSuccess() {
        if ('vibrate' in navigator) {
            // Padrão: vibração, pausa, vibração
            navigator.vibrate([100, 50, 100]);
        }
    }

    /**
     * Exibe os botões de ação para uma URL detectada, exigindo confirmação manual
     * para previnir phishing/redirecionamentos abertos.
     * @param {string} url - A URL detectada
     * @param {Function} onAccess - Callback de quando o usuário clica para acessar o link
     * @param {Function} onCancel - Callback de quando o usuário cancela para retomar o escaneamento
     */
    showUrlAction(url, onAccess, onCancel) {
        if (!this.actionContainer) return;
        
        // Remove os ouvintes (listeners) anteriores usando nós clonados (uma abordagem mais limpa)
        const newAccessBtn = this.accessLinkBtn.cloneNode(true);
        const newResumeBtn = this.resumeScanBtn.cloneNode(true);
        
        this.accessLinkBtn.parentNode.replaceChild(newAccessBtn, this.accessLinkBtn);
        this.resumeScanBtn.parentNode.replaceChild(newResumeBtn, this.resumeScanBtn);
        
        // Reatribuir referências
        this.accessLinkBtn = newAccessBtn;
        this.resumeScanBtn = newResumeBtn;

        // Adicionar novos ouvintes (listeners)
        this.accessLinkBtn.addEventListener('click', () => onAccess());
        this.resumeScanBtn.addEventListener('click', () => {
            this.actionContainer.classList.add('hidden');
            this.actionContainer.setAttribute('aria-hidden', 'true');
            onCancel();
        });

        // Exibe o contêiner
        this.actionContainer.classList.remove('hidden');
        this.actionContainer.setAttribute('aria-hidden', 'false');
    }
}
