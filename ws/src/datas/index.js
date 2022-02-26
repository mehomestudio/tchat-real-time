const {getAllMessages, saveNewMessages, saveUpdateMessages} = require("../queries/message.queries");

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
         * @type {{newMessages: *[], updateMessages: *[]}}
         * @private
         */
        this._syncDatas = {
            newMessages: [],
            updateMessages: []
        };

        /**
         *
         * @private
         */
        this._saveDatas = () => {
            setTimeout(() => {
                if (this._syncDatas.newMessages.length > 0 || this._syncDatas.updateMessages.length > 0) {
                    if (this._syncDatas.newMessages.length > 0) {
                        saveNewMessages(this._syncDatas.newMessages)
                            .then((response) => {
                                if (response.status) {
                                    this._syncDatas.newMessages = [];
                                }
                                console.log(response.result.code + " " + response.result.message);
                            });
                    }

                    if (this._syncDatas.updateMessages.length > 0) {
                        saveUpdateMessages(this._syncDatas.updateMessages, true)
                            .then((response) => {
                                if (response.status) {
                                    this._syncDatas.updateMessages = [];
                                }
                                console.log(response.result.code + " " + response.result.message);
                            })
                    }
                } else {
                    console.log("[Synchronisation] aucune donnée à synchroniser");
                }
                this._saveDatas();
            }, (this._TIME_SAVE));
        }

        this._generateTokensToAllMessages = async () => {
            //return await generateTokenBeforeLoadMessages();
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
     * @param message
     * @param action
     */
    actionMessage(message, action) {
        if (action === "deleted") {
            message.setContent("Le message a été supprimé.");
        }

        if (action === "add") {
            this._messages.push(message);
            this._syncDatas.newMessages.push(message);
        } else {
            const indexMessage = this._messages.findIndex((m) => m.getTokenActions() === message.getTokenActions());
            if (indexMessage > 0) {
                this._messages[indexMessage].setContent(message.getContent());
                this._syncDatas.updateMessages.push(this._messages[indexMessage]);
            }
        }
    }
}

module.exports = Datas;