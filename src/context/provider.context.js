import { useReducer } from 'react';
import { initState, reducer } from './reducer.context';
import StateContext from './context.context';
function StateProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initState);
    return <StateContext.Provider value={[state, dispatch]}>{children}</StateContext.Provider>;
}
export default StateProvider;
