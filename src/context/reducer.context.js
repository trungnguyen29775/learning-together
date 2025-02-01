import {
    CHANGE_CHAT_ROOM,
    CHANGE_COMPONENT,
    GET_CHAT_DATA,
    GET_DATA_OTHER_USER,
    GET_DATA_USER,
    GET_MESSAGE_DATA,
    LOGGED,
    LOGGOUT,
} from './constant.context';

export const initState = {
    login: false,
    userData: {},
    currentComponent: 'home',
};

export const reducer = (state, action) => {
    switch (action.type) {
        case LOGGED: {
            return {
                ...state,
                login: true,
            };
        }

        case CHANGE_COMPONENT: {
            return {
                ...state,
                currentComponent: action.payload,
            };
        }

        case GET_DATA_USER: {
            return {
                ...state,
                userData: action.payload,
            };
        }

        case GET_DATA_OTHER_USER: {
            return {
                ...state,
                otherUserData: action.payload,
                roomChat: action.payload[0],
            };
        }

        case CHANGE_CHAT_ROOM: {
            return {
                ...state,
                roomChat: action.payload,
            };
        }

        case GET_MESSAGE_DATA: {
            return {
                ...state,
            };
        }
        case GET_CHAT_DATA: {
            return {
                ...state,
                chatData: action.payload,
            };
        }

        case LOGGOUT: {
            return {
                initState,
            };
        }
        default: {
            console.log('Invalid Action');
            return state;
        }
    }
};
