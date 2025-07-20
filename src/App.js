import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Admin from './pages/admin/admin';
import './App.css';
import Login from './pages/login/login';
import Register from './pages/register/register';
import { useContext, useEffect } from 'react';
import StateContext from './context/context.context';
import MainLayout from './layout/mainLayout';
import Hobby from './components/hobby';
import { socket } from './socket';
import ImageUploadPage from './components/imageUploadPage';
import AdminUserManagement from './components/AdminUserManagement';

function App() {
    const [state, dispatchState] = useContext(StateContext);
    const navigate = useNavigate();
    const userProfile = state.userData || {};
    const likedUsers = state.likedUsers || [];
    useEffect(() => {
        if (state.loggin === false) navigate('/login');
        if (state.login === true) {
            socket.emit('online', { user_id: state.userData.user_id });
            if (state.userData?.role === 'admin') {
                navigate('/admin');
            }
        }
    }, [state]);

    return (
        <div>
        <Routes>
            <Route path="/login" element={<Login navigation={navigator} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<MainLayout />} />
            <Route path="/hobby" element={<Hobby />} />
            <Route path="/up-load-image" element={<ImageUploadPage />} />
            <Route path="/admin" element={<AdminUserManagement />} />
        </Routes>
        </div>
    );
}

export default App;
