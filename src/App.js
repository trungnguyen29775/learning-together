import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/register/register';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login navigation={navigator} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
