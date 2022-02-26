class MessagesCode {
    // USER
    static USER_ALREADY_CONNECTED = {
        error: "Compte utilisateur déjà connecté",
        message: "Votre compte est déjà connecté sur notre serveur."
    };

    static USER_DOUBLE_CONNEXION_DETECTED = {
        error: 'Nouvelle connexion détectée',
        message: "Une nouvelle connexion a été détecté sur votre compte, vous allez être déconnecté."
    };

    static USER_TOKEN_CHECK_FAILED = {
        error: "Token invalide",
        message: "Une erreur s'est produite lors de la vérification de votre session, vous allez être déconnecté " +
            "et redirigé vers la page de connexion"
    };

    static MESSAGE_NOT_GET_ALL = {
        error: "Impossible de récupérer les messages",
        message: "Une erreur s'est produite lors de la récupération des messages, vous allez être déconnecté " +
            "et redirigé vers la page de connexion"
    };
}

module.exports = MessagesCode;