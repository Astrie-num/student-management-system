import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    // Client-side validation
    const validateForm = () => {
        if (!form.email || !form.password) {
            setError('Email and password are required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError('Invalid email format');
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        setError('');
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email: form.email,
                password: form.password,
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.status === 200) {
                setOtpSent(true);
                setError('OTP sent to your email. Please verify.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
            console.error('Login error:', err.response || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/verify-login', {
                email: form.email,
                otp,
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.user.role);
                console.log('Login response:', response.data);
                setError('Logged in successfully! Redirecting...');
                const redirectPath = response.data.user.role.toLowerCase() === 'admin' ? '/dashboard' : '/';
                setTimeout(() => (window.location.href = redirectPath), 1000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Try again.');
            console.error('Verify error:', err.response || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {loading && <p className="text-center text-gray-500 mb-4">Loading...</p>}
            <div className="space-y-4">
                <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send OTP'}
                </button>
                {otpSent && (
                    <>
                        <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                            onClick={handleVerify}
                            disabled={loading || !otp}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Login;