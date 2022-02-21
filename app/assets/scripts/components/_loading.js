/**
 * Gestion d'une page de chargement lors d'une attente de traitement
 *
 * @todo Afficher une page de chargement
 */
export class LoadingPage {
    /**
     * @param {HTMLElement} element
     */
    constructor(element) {
        this.element = element;
    }

    /**
     * Customise le message
     * @param {string} msg
     */
    updateMsg(msg) {
        const loadingText = this.loadingContainer.querySelector('.loading-text');
        loadingText.innerHTML = msg;
    }

    /**
     * Affiche la page de chargement
     */
    show() {
        this.loadingContainer = document.createElement('div');
        this.loadingContainer.classList.add('loading');

        const loadingElement = document.createElement('div');
        loadingElement.classList.add('loading-circleborder');

        const loadingText = document.createElement('div');
        loadingText.classList.add('loading-text');

        this.loadingContainer.appendChild(loadingElement);
        this.loadingContainer.appendChild(loadingText);
        this.element.prepend(this.loadingContainer);
    }

    /**
     * Supprime la page de chargement
     */
    hide() {
        setTimeout(() => this.loadingContainer.remove(), 2000);
    }
}