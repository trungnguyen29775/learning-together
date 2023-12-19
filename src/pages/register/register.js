import { useEffect, useState } from 'react';
import instance from '../../axios/instance';
import './register.css';
import { FaArrowLeft } from 'react-icons/fa';
import Waiting from '../../components/waitingCompoent/waiting';
import Succeed from '../../components/succeed/succeed';
import { useNavigate } from 'react-router-dom';
function Register() {
    // navigate
    const navigate = useNavigate();

    // useState
    const [registerName, setRegisterName] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerRePassword, setRegisterRePassword] = useState('');
    const [registerStatus, setRegisterStatus] = useState('register');

    // useEffect

    useEffect(() => {
        if (registerStatus === 'registerSucceed') {
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        }
    }, [registerStatus]);

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setRegisterStatus('onRegister');
        instance
            .post('/register', { username: registerName, password: registerPassword, name: registerName })
            .then((res) => {
                console.log(res.status);
                if (res.status == 200) {
                    setTimeout(function () {
                        setRegisterStatus('registerSucceed');
                    }, 500);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleChangeRegisterUsernameChange = (event) => {
        setRegisterUsername(event.target.value);
    };

    const handleChangeRegisterNameChange = (event) => {
        setRegisterName(event.target.value);
    };

    const handleChangeRegisterPasswordChange = (event) => {
        setRegisterPassword(event.target.value);
    };

    const handleChangeRegisterRePasswordChange = (event) => {
        setRegisterRePassword(event.target.value);
    };

    return (
        <div className="register-wrapper">
            {registerStatus === 'onRegister' ? <Waiting /> : registerStatus === 'registerSucceed' ? <Succeed /> : ''}

            <form onSubmit={(e) => handleSubmit(e)} className="register-form">
                <span className="register-header">Register</span>
                <div className="register-input-container">
                    <input
                        name="name"
                        value={registerName}
                        onChange={(e) => handleChangeRegisterNameChange(e)}
                        placeholder="Name"
                    />

                    <input
                        name="username"
                        onChange={(e) => handleChangeRegisterUsernameChange(e)}
                        value={registerUsername}
                        placeholder="Username"
                    />
                    <input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => handleChangeRegisterPasswordChange(e)}
                        name="password"
                        placeholder="Password"
                    />
                    <input
                        type="password"
                        value={registerRePassword}
                        onChange={(e) => handleChangeRegisterRePasswordChange(e)}
                        placeholder="Re-Enter Password"
                    />

                    {/* <a href="#">Forgot Password?</a> */}
                </div>
                <button type="submit" className="register__button">
                    Register
                </button>
                <div className="register-register-ask">
                    <span className="register-register-ask__span ">Already have an account?</span>
                    <button
                        className="register-register__button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate('/login');
                        }}
                    >
                        <FaArrowLeft style={{ position: 'absolute', left: '10px', top: '15px' }} />
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Register;
