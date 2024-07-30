import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Register.css';

function Register() {
    const [values, setValues] = useState({
        UserName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setValues(prevValues => ({
            ...prevValues,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (values.password !== values.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8081/register', values);
            if (response.data.success) {
                alert(response.data.message);
                navigate("/login");
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error registering user:', error);
            alert('An error occurred while registering. Please try again.');
        }
    };

    const handleSigninClick = () => {
        navigate("/login");
    };

    return (
        <div className="register-container">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        id="UserName"
                        value={values.UserName}
                        onChange={handleChange}
                        placeholder="User Name"
                        required
                        autoComplete="username"
                    />
                    <label htmlFor="UserName">Username</label>
                </div>
                <div className="form-group">
                    <input
                        type="email"
                        id="email"
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
                        value={values.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                        autoComplete="new-password"
                    />
                    <label htmlFor="password">Password</label>
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        id="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        required
                        autoComplete="new-password"
                    />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                </div>
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <a onClick={handleSigninClick} href="#">Login</a>
            </p>
            <p>
                By registering, you agree to Streamvid's <a href="/terms">Terms of Use</a> and <a href="/privacy">Privacy Policy</a>.
            </p>
        </div>
    );
}

export default Register;
