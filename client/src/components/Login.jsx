import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onClose, onSwitch }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold mb-4">Login</h2>
                {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button className="btn btn-primary w-full">Login</button>
                </form>
                <div className="mt-4 text-center space-y-2">
                    <small className="text-slate-600">No account? <button onClick={onSwitch} className="text-indigo-600 font-medium hover:text-indigo-800">Register</button></small>
                    <br />
                    <small><button onClick={onClose} className="text-slate-400 hover:text-slate-600">Close</button></small>
                </div>
            </div>
        </div>
    );
}
