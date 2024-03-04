import { CHANGE_CHAT_ROOM, GET_DATA_OTHER_USER, GET_DATA_USER, GET_MESSAGE_DATA, LOGGED } from './constant.context';

export const initState = {
    login: false,
    userData: {},
};

export const reducer = (state, action) => {
    switch (action.type) {
        case LOGGED: {
            return {
                ...state,
                login: true,
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

        case GET_MESSAGE_DATA:{
            return{
                ...state,
                
            }
        }
        default: {
            console.log('Invalid Action');
            return state;
        }
    }
};
