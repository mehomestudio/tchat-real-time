const {getAllMessages} = require("../queries/message.queries");

class Datas {

    constructor() {
        /**
         *
         * @type {null|[]}
         * @private
         */
        this._onlines = [];

        /**
         *
         * @type {null|[]}
         * @private
         */
        this._messages = [];

        this._loadMessages = async () => {
            return await getAllMessages();
        }

        this._loadMessages()
            .then((result) => {
                this._messages = result;
            });
    }

    /**
     *
     * @returns {[]|null}
     */
    getUsersOnline() {
        return this._onlines;
    }

    /**
     *
     * @param {User} user
     */
    addUserOnline(user) {
        this._onlines.push(user);
    }

    /**
     *
     * @param {string} idWs
     */
    removeUserOnline(idWs) {
        this._onlines = this._onlines.filter((u) => u.getIdWs() !== idWs);
    }

    /**
     *
     * @returns {[]|null}
     */
    getMessages() {
        return this._messages;
    }

    /**
     *
     * @param {Message} message
     */
    addMessage(message) {
        this._messages.push(message);
    }

    /**
     *
     */
    resetMessages() {
        this._messages = [];
    }
}

module.exports = Datas;