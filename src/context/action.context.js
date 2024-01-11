import { GET_DATA_USER, LOGGED } from './constant.context';

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
