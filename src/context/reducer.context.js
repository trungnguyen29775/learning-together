import { GET_DATA_USER, LOGGED } from './constant.context';

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
    }
};
