import {User} from "../entity/user";

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

        this._createMessageDOM = (message) => {
            const messageElement = document.createElement('div');
            const header = document.createElement('div');
            const body = document.createElement('div');
            const pseudo = document.createElement('span');
            const date = document.createElement('span');
            const heure = document.createElement('span');

            pseudo.className = "chat-messages-pseudo";
            pseudo.innerHTML = this._escapeHtml(message.getAuthor());
            date.className = "chat-messages-date";
            date.innerHTML = message.getCreatedAt().toLocaleDateString('fr');
            heure.className = "chat-messages-heure";
            heure.innerHTML = message.getCreatedAt().getHours() + ":" + message.getCreatedAt().getMinutes();
            header.className = "chat-messages-header";
            header.append(pseudo, date, heure);

            body.className = "chat-messages-body";
            body.innerHTML = this._escapeHtml(message.getContent());

            messageElement.className = "chat-messages";
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

            console.log("1. ==> "+this._DOMElement.columns.messages.scrollHeight);

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
            inputSendMessage: document.querySelector('.chat .chat-messages-list-footer .chat-messages-send input[name="message"]')
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

        this._DOMElement.inputSendMessage.addEventListener('keyup', (e) => {
            if (e.key === "Enter" && e.currentTarget.value !== "")
            {
                this.addMessage(e.currentTarget.value, () => {
                    e.currentTarget.value = "";
                });
            }
        });

        this._loadDOM();

    }

    /**
     *
     * @param value
     * @param {function} cb
     */
    addMessage(value, cb)
    {
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