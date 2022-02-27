/**
 * Class Message
 */
class Message {

    constructor() {
        /**
         *
         * @type {{avatar: null, pseudo: null}}
         * @private
         */
        this._author = {
            "pseudo": null,
            "avatar": null
        };

        /**
         * @type {Date|null}
         * @private
         */
        this._createdAt = null;

        /**
         * @type {string|null}
         * @private
         */
        this._content = null;

        /**
         *
         * @type {string|null}
         * @private
         */
        this._tokenActions = null;
    }

    /**
     *
     * @returns {string|null}
     */
    getAuthor() {
        return this._author;
    }

    /**
     *
     * @param {String} author
     * @param {String} avatar
     * @returns {Message}
     */
    setAuthor(author, avatar) {
        this._author.pseudo = author;
        this._author.avatar = avatar;
        return this;
    }

    /**
     *
     * @returns {Date|null}
     */
    getCreatedAt() {
        return this._createdAt;
    }

    /**
     *
     * @param {Date} createdAt
     * @returns {Message}
     */
    setCreatedAt(createdAt) {
        this._createdAt = createdAt;
        return this;
    }

    /**
     *
     * @returns {string|null}
     */
    getContent() {
        return this._content;
    }

    /**
     *
     * @param {string} content
     * @returns {Message}
     */
    setContent(content) {
        this._content = content;
        return this;
    }

    /**
     *
     * @returns {string|null}
     */
    getTokenActions() {
        return this._tokenActions;
    }

    /**
     *
     * @param {string} tokenActions
     * @returns {Message}
     */
    setTokenActions(tokenActions) {
        this._tokenActions = tokenActions;
        return this;
    }
}

/**
 * @type {Message}
 */
module.exports = Message;