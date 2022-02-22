const {getAllMessages, saveNewMessages} = require("../queries/message.queries");

class Datas {

    constructor() {
        /**
         *
         * @type {number}
         * @private
         */
        this._TIME_SAVE = 1000*15;

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

        /**
         *
         * @type {null|[]}
         * @private
         */
        this._newMessages = [];

        /**
         *
         * @private
         */
        this._saveDatas = () => {
            setTimeout(() => {
                if (this._newMessages.length > 0) {
                    saveNewMessages(this._newMessages)
                        .then((response) => {
                            if (response.status) {
                                this._newMessages = [];
                            }
                            console.log(response.result.code + " " + response.result.message);
                        });
                } else {
                    console.log("[Synchronisation] aucune donnée à synchroniser");
                }
                this._saveDatas();
            }, (this._TIME_SAVE));
        }

        this._loadMessages = async () => {
            return await getAllMessages();
        }

        this._loadMessages()
            .then((result) => {
                this._messages = result;
            });

        this._saveDatas();
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
        this._newMessages.push(message);
    }
}

module.exports = Datas;