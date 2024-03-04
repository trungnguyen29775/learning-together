import { CHANGE_CHAT_ROOM, GET_DATA_OTHER_USER, GET_DATA_USER, GET_MESSAGE_DATA, LOGGED } from './constant.context';

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
