const { getUserByToken } = require("../../queries/user.queries")
const { datas } = require("../../server/server");
const StatusCode = require('../../consts/StatusCode');
const MessagesCode = require('../../consts/MessagesCode');

exports.globalLoadCurrentUser = async (token, idWs) => {
    let result = {
        currentUser: null,
        error: {
            status: StatusCode.STEP_STATUS_SUCCESS,
            message: ""
        }
    };

    const response = await getUserByToken(token)

    if (response) {
        result.currentUser = response;
        result.currentUser.setIdWs(idWs);
        const isUser = isUserAlreadyOnline(result.currentUser.getPseudo());

        if (isUser.status === StatusCode.STEP_STATUS_FAILED) {
            result.error = {
                status: isUser.status,
                message: isUser.result
            }
        }
    } else {
        result.error = {
            status: StatusCode.STEP_STATUS_FAILED,
            message: MessagesCode.USER_TOKEN_CHECK_FAILED
        };
    }

    return result;
};

const isUserAlreadyOnline = (pseudo) => {
    const testUser = datas.getUsersOnline().filter(online => online.getPseudo() === pseudo);
    return testUser.length > 0 ? {
        status: StatusCode.STEP_STATUS_FAILED,
        result: {
            message: MessagesCode.USER_DOUBLE_CONNEXION_DETECTED,
            idWs: testUser[0]._idWs
        }
    } : {
        status: StatusCode.STEP_STATUS_SUCCESS
    };
}