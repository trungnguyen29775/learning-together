import { initState, reducer } from './reducer.context';

const store = {
    reducer: reducer,
    initState: initState,
};
export * as action from './action.context';
export default store;
