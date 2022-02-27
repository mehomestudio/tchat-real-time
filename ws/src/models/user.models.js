/**
 * Class {User} User
 */
class User {

    constructor() {
        /**
         * @type {String|null}
         * @private
         */
        this._idWs = null;

        /**
         * @type {String|null}
         * @private
         */
        this._pseudo = null;

        /**
         * @type {String|null}
         * @private
         */
        this._token = null;

        /**
         * @type {String|null}
         * @private
         */
        this._avatar = null;

        return this;
    }

    /**
     *
     * @returns {String|null}
     */
    getIdWs = () => {
        return this._idWs;
    }

    /**
     * @param {String} idWs
     * @returns {User}
     */
    setIdWs = (idWs) => {
        this._idWs = idWs;
        return this;
    }

    /**
     *
     * @returns {String|null}
     */
    getPseudo = () => {
        return this._pseudo;
    }

    /**
     *
     * @param {String} pseudo
     * @returns {User}
     */
    setPseudo = (pseudo) => {
        this._pseudo = pseudo;
        return this;
    }

    /**
     *
     * @returns {String|null}
     */
    getToken = () => {
        return this._token;
    }

    /**
     *
     * @param {String} token
     * @returns {User}
     */
    setToken = (token) => {
        this._token = token;
        return this;
    }

    /**
     *
     * @returns {String|null}
     */
    getAvatar = () => {
        return this._avatar;
    }

    /**
     *
     * @param {String} avatar
     * @returns {User}
     */
    setAvatar = (avatar) => {
        this._avatar = avatar;
        return this;
    }
}

/**
 * @type {User}
 */
module.exports = User;