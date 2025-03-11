import { io } from 'socket.io-client';
import severURL from '../constant/severUrl';
export const socket = io.connect(severURL, { reconnection: false });
