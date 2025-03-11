import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './pages/login/login';
import Register from './pages/register/register';
import { useContext, useEffect } from 'react';
import StateContext from './context/context.context';
import MainLayout from './layout/mainLayout';
import Hobby from './components/hobby';
import { socket } from './socket';

function App() {
    const [state, dispatchState] = useContext(StateContext);
    const navigate = useNavigate();
    useEffect(() => {
        if (state.loggin === false) navigate('/login');
        console.log(state);
        if (state.login === true) {
            socket.emit('online', { user_id: state.userData.user_id });
        }
    }, [state]);

    return (
        <Routes>
            <Route path="/login" element={<Login navigation={navigator} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<MainLayout />} />
            <Route path="/hobby" element={<Hobby />} />
        </Routes>
    );
}

export default App;
