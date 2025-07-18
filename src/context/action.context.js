import {
    CHANGE_CHAT_ROOM,
    CHANGE_COMPONENT,
    GET_CHAT_DATA,
    GET_DATA_OTHER_USER,
    GET_DATA_USER,
    GET_MESSAGE_DATA,
    LOGGED,
    LOGGOUT,
    ADD_NOTIFY,
} from './constant.context';

export const setIncomingCall = (payload) => ({
    type: 'SET_INCOMING_CALL',
    payload,
});

export const clearIncomingCall = () => ({
    type: 'CLEAR_INCOMING_CALL',
});

export const logged = () => {
    return {
        type: LOGGED,
    };
};

export const getDataUser = (payload) => {
    return {
        type: GET_DATA_USER,
        payload,
    };
};

export const getDataOtherUser = (payload) => {
    return {
        type: GET_DATA_OTHER_USER,
        payload,
    };
};

export const changeChatRoom = (payload) => {
    return {
        type: CHANGE_CHAT_ROOM,
        payload,
    };
};

export const getMessageData = (payload) => {
    return {
        type: GET_MESSAGE_DATA,
        payload,
    };
};

export const getChatData = (payload) => {
    return {
        type: GET_CHAT_DATA,
        payload,
    };
};

export const changeComponent = (payload) => {
    return {
        type: CHANGE_COMPONENT,
        payload,
    };
};

export const loggout = (payload) => {
    return {
        type: LOGGOUT,
        payload,
    };
};

export const messageNotify = (payload) => {
    return {
        type: ADD_NOTIFY,
        payload,
    };
};
