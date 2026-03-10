export class UIHandler {
    constructor() {
        this.wrapper = document.getElementById('reader-wrapper');
        this.resultText = document.getElementById('result-text');
        this.statusBadge = document.getElementById('status-badge');
        this.errorText = document.querySelector('.error-text');
    }

    /**
     * Sets the visual state of the scanner UI.
     * @param {'loading' | 'active' | 'success' | 'error'} state
     * @param {string} customErrorMessage - Optional custom error text
     */
    setState(state, customErrorMessage = '') {
        // Reset specific state classes on the wrapper
        this.wrapper.classList.remove('state-loading', 'state-active', 'state-success', 'state-error');
        this.wrapper.classList.add(`state-${state}`);
        
        // Hide all overlays strictly via ARIA
        const overlays = document.querySelectorAll('.overlay');
        overlays.forEach(overlay => {
            overlay.setAttribute('aria-hidden', 'true');
        });

        // Show the target overlay if it exists
        const targetOverlay = document.querySelector(`.${state}-overlay`);
        if (targetOverlay) {
            targetOverlay.setAttribute('aria-hidden', 'false');
        }

        // Handle specific logic per state
        switch (state) {
            case 'loading':
                this.updateStatus('Acessando câmera...', 'default');
                break;
            case 'active':
                this.updateStatus('Pronto para ler', 'default');
                break;
            case 'success':
                // Handled primarily by the ScannerEngine for specific text
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
     * Updates the text and semantic meaning of the status badge below the scanner.
     * @param {string} message - Text to display
     * @param {'default' | 'success' | 'error'} type - Style variant
     */
    updateStatus(message, type) {
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
     * Triggers the Vibration API if supported by the device.
     */
    vibrateSuccess() {
        if ('vibrate' in navigator) {
            // Pattern: vibration, pause, vibration
            navigator.vibrate([100, 50, 100]);
        }
    }
}
