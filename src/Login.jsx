import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Login.css';

function Login() {
    const [values, setValues] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:8081/login', values);
            if (res.data.success) {
                // Store user info in local storage
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/dashboard');
            } else {
                setError(res.data.message || "Signin failed. Please check your credentials.");
            }
        } catch (err) {
            console.error('Request error:', err.response ? err.response.data : err.message);
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignupClick = () => {
        navigate("/register");
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                        autoComplete="email"
                    />
                    <label htmlFor="email">Email</label>
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                        autoComplete="current-password"
                    />
                    <label htmlFor="password">Password</label>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <p>
                Don't have an account? <a onClick={handleSignupClick} href="#">Register</a>
            </p>
            <p>
                By logging in, you agree to Streamvid's <a href="/terms">Terms of Use</a> and <a href="/privacy">Privacy Policy</a>.
            </p>
        </div>
    );
}

export default Login;
