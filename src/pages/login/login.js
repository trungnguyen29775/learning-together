import { useEffect, useState } from 'react';
import './login.css';
import instance from '../../axios/instance';
import { useNavigate } from 'react-router-dom';
import Waiting from '../../components/waitingCompoent/waiting';
import { FaArrowRight } from 'react-icons/fa';

function Login() {
    // useState
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginStatus, setLoginStatus] = useState('unLogin');
    const navigate = useNavigate();
    // useEffect
    useEffect(() => {
        if (loginStatus === 'logged') navigate('/home');
    }, [loginStatus]);
    // function
    const handleSubmit = (event) => {
        event.preventDefault();
        setLoginStatus('onLogin');
        instance
            .post('/login', {
                username: loginUsername,
                password: loginPassword,
            })
            .then((response) => {
                console.log(response.status);
                if (response.status === 200) {
                    setTimeout(() => {
                        setLoginStatus('logged');
                    }, 1000);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handelUsernameChange = (event) => {
        setLoginUsername(event.target.value);
    };

    const handleChangePassword = (event) => {
        setLoginPassword(event.target.value);
    };
    return (
        <div className="login-wrapper">
            {loginStatus === 'onLogin' ? <Waiting /> : ''}
            <form className="login-form" onSubmit={(e) => handleSubmit(e)}>
                <span className="login-header">Login</span>
                <div className="login-input-container">
                    <input
                        value={loginUsername}
                        onChange={(e) => handelUsernameChange(e)}
                        name="username"
                        placeholder="Username"
                    />
                    <input
                        value={loginPassword}
                        onChange={(e) => handleChangePassword(e)}
                        name="password"
                        type="password"
                        placeholder="Password"
                    />
                    <a href="#">Forgot Password?</a>
                </div>
                <button type="submit" className="login__button">
                    Login
                </button>
                <div className="login-register-ask">
                    <span className="login-register-ask__span ">Don't have an account?</span>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate('/register');
                        }}
                        className="login-register__button"
                    >
                        <FaArrowRight style={{ position: 'absolute', right: '10px', top: '15px' }} />
                        Register
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Login;
