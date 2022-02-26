/**
 * Gestion des notifications pour les flash bag ou retour des réponses de requêtes HTTP
 *
 * @todo Afficher une notification
 */
export class Notify {

    static ERROR = "error";
    static INFO = "info";
    static SUCCESS = "success";

    constructor() {
        this._element = document.querySelector('.notify');
        this._config = {
            type: "",
            title: "",
            message: "",
            duration: 3000,
            showClose: true
        };

        /**
         * Prend en compte les options en plus de ceux par défaut
         * @param {Object} options
         * @private
         */
        this._setConfig = (options) => {
            this._config = {
                ...this._config,
                ...options
            };
        }

        /**
         * Génère les événements sur l'élément de notification
         * @param {HTMLElement} element
         * @private
         */
        this._addEvents = (element) => {
            element.removeEventListener('mouseover', null);
            element.removeEventListener('mouseout', null);

            const _removeNotify = () => {
                element.remove();
            };
            const close = element.querySelector('.close');
            let timeout = setTimeout(_removeNotify, this._config.duration);

            element.addEventListener('mouseover', () => {
                clearTimeout(timeout);
            });

            element.addEventListener('mouseout', () => {
                timeout = setTimeout(_removeNotify, this._config.duration);
            });

            if (this._config.showClose) {
                close.addEventListener('click', () => {
                    clearTimeout(timeout);
                    _removeNotify();
                });
            }
        };

        /**
         * Créer et retour un élément HTML de notification
         * @returns {HTMLElement}
         * @private
         */
        this._create = () => {
            let notify = document.createElement('div');
            notify.setAttribute('data-notify', '');
            notify.className = "notify-"+this._config.type;
            notify.innerText = this._config.message;

            if (this._config.showClose) {
                let close = document.createElement('div');
                close.className = "close";
                close.innerText = "X";

                notify.prepend(close);
            }

            this._element.prepend(notify);

            return notify;
        };
    }

    /**
     * Renvoie une notification erreur
     * @param {string} type
     * @param {string} message
     * @param {string} title
     * @param {Object} options
     */
    static notify(type, message, title = "", options = {}) {
        const notify = new Notify();
        notify._config.type = type;
        notify._config.message = message;
        notify._config.title = title;
        notify._setConfig(options);

        const element = notify._create();
        notify._addEvents(element);
    }

    /**
     * Renvoie une notification réussie
     * @param {string} message
     * @param {string} title
     * @param {Object} options
     */
    static success(message, title= "", options = {}) {
        Notify.notify(Notify.SUCCESS, message, title, options);
    }

    /**
     * @param {string} message
     * @param {string} title
     * @param {Object} options
     */
    static error(message, title= "", options = {}) {
        Notify.notify(Notify.ERROR, message, title, options);
    }

    /**
     * @param {string} message
     * @param {string} title
     * @param {Object} options
     */
    static info(message, title= "", options = {}) {
        Notify.notify(Notify.INFO, message, title, options);
    }

    /**
     * Récupère les notifications issue des flash bag
     */
    static bind() {

        const notifies = document.querySelectorAll('.notify div[data-notify]');

        notifies.forEach((notify) => {
            new Notify()._addEvents(notify);
        });
    }
}