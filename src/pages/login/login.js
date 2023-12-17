import './login.css';

function Login() {
    return (
        <div className="login-wrapper">
            <form className="login-form">
                <span className="login-header">Login</span>
                <div className="login-input-container">
                    <input placeholder="Username" />
                    <input placeholder="Password" />
                    <a href="#">Forgot Password?</a>
                </div>
                <button type="submit" className="login__button">
                    Login
                </button>
                <div className="login-register-ask">
                    <span className="login-register-ask__span ">Don't have an account?</span>
                    <button className="login-register__button">Register</button>
                </div>
            </form>
        </div>
    );
}

export default Login;
