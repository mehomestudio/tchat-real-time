/**
 * Class User
 */
export class User {
    /**
     * @type {String|null}
     * @private
     */
    _idWs = null;

    /**
     * @type {String|null}
     * @private
     */
    _pseudo = null;

    /**
     * @type {String|null}
     * @private
     */
    _token = null;

    /**
     * @type {String|null}
     * @private
     */
    _avatar = null;

    constructor() {
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