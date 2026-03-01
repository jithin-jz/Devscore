import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../lib/api';
import { Shield } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await adminLogin(username, password);
            login(res.data.token, res.data.user);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to authenticate. Are you an admin?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ds-bg text-ds-text selection:bg-white selection:text-black flex flex-col items-center justify-center p-6 dot-grid">
            <div className="noise-overlay" />

            <div className="w-full max-w-md space-y-8 animate-premium-fade-in relative z-10">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-ds-border shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Shield className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Command Center</h1>
                    <p className="ds-label opacity-70">Secured Access Only</p>
                </div>

                <div className="ds-panel p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-ds-danger/10 border border-ds-danger/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-ds-danger text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="ds-label block mb-1">Admin Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-black/50 border border-ds-border rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-white transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="ds-label block mb-1">Access Passcode</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-ds-border rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-white transition-colors"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !username || !password}
                            className={`w-full btn-premium flex justify-center py-4 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'Authenticating...' : 'Override Protocol'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[9px] font-black text-ds-muted uppercase tracking-widest">
                    DevScore Security Infrastructure
                </p>
            </div>
        </div>
    );
}
