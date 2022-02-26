import {User} from "../entity/user";
import {Message} from "../entity/message";

/**
 * Gestion du chat
 */
export class Chat {

    /**
     * Application du chat
     * @param currentUser
     * @param listMessages
     * @param listUsersOnline
     * @param listRooms
     */
    constructor(
        currentUser = null,
        listMessages = [],
        listUsersOnline = [],
        listRooms = []
    ) {

        /**
         * Tri la liste des utilisateurs par pseudo
         * @param a
         * @param b
         * @returns {number}
         * @private
         */
        this._sortByPseudo = (a, b) => {
            return a.getPseudo() < b.getPseudo() ? -1 :
                a.getPseudo() > b.getPseudo() ? 1 :
                    0;
        }

        /**
         * Scroll maximum un élément
         * @param element
         * @private
         */
        this._updateScroll = (element) => {
            element.scrollTo(0, element.scrollHeight);
        };

        /**
         * Vérification faille XSS
         * @param text
         * @returns {*}
         * @private
         */
        this._escapeHtml = (text) => {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };

            return text.replace(/[&<>"']/g, (m) => { return map[m]; });
        };

        /**
         *
         * @param text
         * @returns {*}
         * @private
         */
        this._formatHtml = (text) => {
            const map = {
                '&amp;': '&',
                '&lt;': '<',
                '&gt;': '>',
                '&quot;': '"',
                '&#039;': "'",
                "\n": " "
        };

            return text.replace(/(&amp;|&lt;|&gt;|&quot;|&#039;|\\n)/g, (m) => { return map[m]; });
        };

        /**
         *
         * @param {Date} date
         * @private
         */
        this._formatDate = (date) => {
            const hours = date.getHours() < 10 ? "0"+date.getHours() : date.getHours();
            const minutes = date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes();
            return {
                date: date.toLocaleDateString('fr'),
                time: hours+":"+minutes
            };
        }

        this._updateCountUsersDOM = () => {
            this._DOMElement.columns.users
                .querySelector('.chat-users-count')
                .innerHTML = this._datas.users.length.toString();
        }

        /**
         * Création d'un élément HTML user
         * @param {User} user
         * @returns {HTMLDivElement}
         * @private
         */
        this._createUserDOM = (user) => {
            const userElement = document.createElement('div');

            userElement.className = "chat-users-body";
            userElement.innerHTML = user.getPseudo();
            userElement.dataset.id = user.getIdWs();

            return userElement;
        }

        this._createRoomDOM = (room) => {
            const roomElement = document.createElement('li');

            roomElement.innerHTML = "# "+room;

            return roomElement;
        }

        this._createEditDOM = (token, cb) => {
            const message = this._datas.messages.find((m) => m.getTokenActions() === token);
            const result = {
                status: true,
                result: {
                    element: null,
                    error: {
                        message: ""
                    }
                }
            };

            if (message) {
                if (message.getAuthor() === this._datas.currentUser.getPseudo()) {
                    const bodyInput = document.createElement('div');
                    const inputEditMessage = document.createElement('textarea');
                    const helpMessageValidaiton = document.createElement("p");
                    const spanHelpMessageButtonValidation = document.createElement("span");
                    const startTextHelpMessageValidation = document.createTextNode("Appuyez sur ");
                    const endTextHelpMessageValidation = document.createTextNode(" pour enregistrer vos modifications.");

                    spanHelpMessageButtonValidation.innerHTML = "Enter"
                    helpMessageValidaiton.append(startTextHelpMessageValidation, spanHelpMessageButtonValidation, endTextHelpMessageValidation);

                    inputEditMessage.dataset.token = token;
                    inputEditMessage.value = this._formatHtml(message.getContent());

                    bodyInput.className = "chat-messages-body-input";
                    bodyInput.append(inputEditMessage, helpMessageValidaiton);

                    result.result.element = bodyInput;
                } else {
                    result.status = false;
                    result.result.error.message = "Vous ne pouvez pas modifier le message d'un autre utilisateur.";
                }
            } else {
                result.status = false;
                result.result.error.message = "Une erreur s'est produite lors de la modification du message.";
            }

            cb(result);
        }

        this._createMessageDOM = (message) => {
            const messageElement = document.createElement('div');
            const header = document.createElement('div');
            const body = document.createElement('div');
            const bodyText = document.createElement('div');
            const pseudo = document.createElement('span');
            const date = document.createElement('span');
            const heure = document.createElement('span');

            let classCurrentUser = "";

            if (message.getAuthor() === this._datas.currentUser.getPseudo()) {
                const tools = document.createElement('div');
                const iconEdit = document.createElement('i');
                const iconTrash = document.createElement('i');

                classCurrentUser = " current-user"

                tools.className = "chat-messages-tools";
                tools.dataset.token = message.getTokenActions();

                iconEdit.className = "fa fa-pen";
                iconTrash.className = "fa fa-trash-alt";

                tools.append(iconEdit, iconTrash);
                messageElement.append(tools);
            }

            pseudo.className = "chat-messages-pseudo" + classCurrentUser;
            pseudo.innerHTML = message.getAuthor();
            date.className = "chat-messages-date";
            date.innerHTML = this._formatDate(message.getCreatedAt()).date;
            heure.className = "chat-messages-heure";
            heure.innerHTML = this._formatDate(message.getCreatedAt()).time;
            header.className = "chat-messages-header";
            header.append(pseudo, date, heure);

            body.className = "chat-messages-body";
            bodyText.className = "chat-messages-body-text";
            bodyText.innerText = this._formatHtml(message.getContent());

            body.append(bodyText);

            messageElement.className = "chat-messages";
            messageElement.dataset.token = message.getTokenActions();
            messageElement.append(header, body);

            return messageElement;
        }

        /**
         * Chargement des éléments du DOM
         * @private
         */
        this._loadDOM = () => {
            const usersDOM = this._DOMElement.columns.users.querySelector('.chat-users');
            this._datas.users.forEach((user) => {
                usersDOM.append(this._createUserDOM(user));
            });

            this._updateCountUsersDOM();

            const roomsDOM = document.createElement('ul');
            this._datas.listRooms.forEach((room, index) => {
                const roomDOM = this._createRoomDOM(room);
                if (index === 0) {
                    roomDOM.className = "active";
                }
                roomsDOM.append(roomDOM);
            });
            this._DOMElement.columns.rooms.append(roomsDOM);

            this._datas.messages.forEach((message) => {
                const messageDOM = this._createMessageDOM(message);
                this._DOMElement.columns.messages.append(messageDOM);
            });

            this._updateScroll(this._DOMElement.columns.messages);
        }

        listUsersOnline.sort(this._sortByPseudo);

        /**
         * Les éléments du DOM
         * @type {{app: Element, columns: {rooms: Element, messages: Element, users: Element}, inputSendMessage: Element}}
         * @private
         */
        this._DOMElement = {
            app: document.querySelector('.chat'),
            columns: {
                rooms: document.querySelector('.chat .chat-rooms'),
                messages: document.querySelector('.chat .chat-messages-list-header'),
                users: document.querySelector('.chat .chat-users-list')
            },
            inputSendMessage: document.querySelector('.chat .chat-messages-list-footer .chat-messages-send textarea[name="message"]')
        };

        /**
         * Les données du serveur
         * @type {{messages: *[], listRooms: *[], users: *[]}}
         * @private
         */
        this._datas = {
            currentUser: currentUser,
            messages: listMessages,
            users: listUsersOnline,
            listRooms: listRooms
        };

        this._loadDOM();

    }

    /**
     * Vérification des caractères et les échappe si nécessaire (&<>"')
     * @param value
     * @returns {*}
     */
    htmlspecialchars(value) {
        return this._escapeHtml(value);
    }

    updateScrollMessages() {
        this._updateScroll(this._DOMElement.columns.messages);
    }

    /**
     *
     * @returns {Element}
     */
    getInputSend() {
        return this._DOMElement.inputSendMessage;
    }

    /**
     *
     * @param {String} value
     * @param {String} actions
     * @param {String|null}token
     * @returns {Message}
     */
    sendMessage(value, actions, token = null)
    {
        if (actions === "add") {
            return new Message()
                .setAuthor(this._datas.currentUser.getPseudo())
                .setContent(this._escapeHtml(value))
                .setCreatedAt(new Date());
        } else {
            const message = this._datas.messages.find((m) => m.getTokenActions() === token);
            if (message) {
                message.setContent(this._escapeHtml(value));
            }
            return message;
        }
    }

    /**
     *
     * @param {Message} msg
     * @returns {HTMLDivElement}
     */
    addMessage(msg)
    {
        const elementDOM = this._createMessageDOM(msg);
        this._DOMElement.columns.messages.append(elementDOM);
        this._datas.messages.push(msg);
        this._updateScroll(this._DOMElement.columns.messages);

        return elementDOM;
    }

    /**
     *
     * @param {Message} msg
     * @returns {boolean}
     */
    updateMessage(msg) {
        const indexMessage = this._datas.messages.findIndex((m) => m.getTokenActions() === msg.getTokenActions());
        const elementDOM = this._DOMElement.columns.messages
            .querySelector('.chat-messages[data-token="'+msg.getTokenActions()+'"] .chat-messages-body-text');
        if (indexMessage >= 0 && elementDOM) {
            this._datas.messages[indexMessage].setContent(msg.getContent());
            elementDOM.innerText = this._formatHtml(msg.getContent());

            return true;
        }

        return false;
    }

    getMessages() {
        return this._datas.messages;
    }

    createEditMessageDOM(token, cb) {
        return this._createEditDOM(token, cb);
    }

    addUser(userWs, cb)
    {
        // Mise à jour de la liste des utilisateurs en ligne
        const user = (new User())
            .setIdWs(userWs._idWs)
            .setPseudo(userWs._pseudo)
            .setToken(userWs._token);

        this._datas.users.push(user);
        this._datas.users.sort(this._sortByPseudo);
        const indexUser = this._datas.users.findIndex(u => u.getIdWs() === user.getIdWs());

        // Mise à jour du DOM
        this._updateCountUsersDOM();
        const usersListDOM = this._DOMElement.columns.users.querySelector('.chat-users');
        const userDOM = this._createUserDOM(user);
        const userBeforeDOM = usersListDOM.children.item(indexUser);

        usersListDOM.insertBefore(userDOM, userBeforeDOM);

        cb(user.getPseudo());
    }

    removeUser(idWs, cb)
    {
        const user = this._datas.users.find(user => user.getIdWs() === idWs);
        const pseudo = user.getPseudo();
        console.log(pseudo);
        this._datas.users = this._datas.users.filter(user => user.getIdWs() !== idWs);

        // Mise à jour du DOM
        this._updateCountUsersDOM();
        this._DOMElement.columns.users.querySelector('.chat-users .chat-users-body[data-id='+ idWs +']').remove();

        cb(pseudo);
    }

}