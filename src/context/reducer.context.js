import { messageNotify } from './action.context';
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
    READ_NOTIFY,
} from './constant.context';

export const initState = {
    login: false,
    userData: {},
    currentComponent: 'home',
    messageNotify: 0,
    notify: [],
    incomingCall: null, // global incoming call info
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
            return initState;
        }

        case ADD_NOTIFY: {
            return {
                ...state,
                messageNotify: state.messageNotify + 1,
            };
        }

        case ADD_NOTIFY: {
            return {
                ...state,
                notify: [...state.notify, action.payload],
            };
        }

        // case READ_NOTIFY:
        //     {
        //         const temp = state.notify
        //         tem
        //     }

        case 'SET_INCOMING_CALL': {
            return {
                ...state,
                incomingCall: action.payload,
            };
        }
        case 'CLEAR_INCOMING_CALL': {
            return {
                ...state,
                incomingCall: null,
            };
        }
        default: {
            console.log('Invalid Action');
            return state;
        }
    }
};
