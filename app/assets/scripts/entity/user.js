/**
 * Class User
 */
export class User {
    /**
     * @type {null}
     * @private
     */
    _idWs = null;

    /**
     * @type {null}
     * @private
     */
    _pseudo = null;

    /**
     * @type {null}
     * @private
     */
    _token = null;

    constructor() {
    }

    /**
     *
     * @returns {string|null}
     */
    getIdWs = () => {
        return this._idWs;
    }

    /**
     * @param idWs
     * @returns {User}
     */
    setIdWs = (idWs) => {
        this._idWs = idWs;
        return this;
    }

    /**
     *
     * @returns {string|null}
     */
    getPseudo = () => {
        return this._pseudo;
    }

    /**
     *
     * @param pseudo
     * @returns {User}
     */
    setPseudo = (pseudo) => {
        this._pseudo = pseudo;
        return this;
    }

    /**
     *
     * @returns {string|null}
     */
    getToken = () => {
        return this._token;
    }

    /**
     *
     * @param token
     * @returns {User}
     */
    setToken = (token) => {
        this._token = token;
        return this;
    }
}