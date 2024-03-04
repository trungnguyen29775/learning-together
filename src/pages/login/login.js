import { useContext, useEffect, useState } from 'react';
import './login.css';
import instance from '../../axios/instance';
import { useNavigate } from 'react-router-dom';
import Waiting from '../../components/waitingCompoent/waiting';
import { FaArrowRight } from 'react-icons/fa';
import StateContext from '../../context/context.context';
import { getDataUser, logged } from '../../context/action.context';
import Notify from '../../components/notify/notify';

function Login() {
    const [state, dispatchState] = useContext(StateContext);
    // useState
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginStatus, setLoginStatus] = useState('unLogin');
    const navigate = useNavigate();
    const [notify, setNotify] = useState('');
    // useEffect
    useEffect(() => {
        if (loginStatus === 'logged') {
            dispatchState(logged(true));
            navigate('/');
        }
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
                    dispatchState(getDataUser(response.data.userData));
                    setTimeout(() => {
                        setLoginStatus('logged');
                    }, 1000);
                } else if (response.status === 500) {
                    console.log('hello');
                }
            })
            .catch((err) => {
                setTimeout(() => {
                    setNotify('Wrong Username');
                    setLoginStatus('loginFail');
                }, 1000);
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
            {loginStatus === 'onLogin' ? <Waiting /> : loginStatus === 'loginFail' ? <Notify message={notify} /> : ''}
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
