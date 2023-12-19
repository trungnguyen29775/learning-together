import axios from 'axios';
import severURL from '../constant/severUrl';

const instance = axios.create({
    baseURL: severURL,
    timeout: 1000,
    headers: { 'X-Custom-Header': 'foobar' },
});
export default instance;
