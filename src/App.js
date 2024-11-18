import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/register/register';
import { useContext, useEffect } from 'react';
import StateContext from './context/context.context';
import MainLayout from './layout/mainLayout';

function App() {
    const [state, dispatchState] = useContext(StateContext);

    useEffect(() => {
        console.log(state);
    }, [state]);

    return (
        <Routes>
            <Route path="/login" element={<Login navigation={navigator} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<MainLayout />} />
        </Routes>
    );
}

export default App;
