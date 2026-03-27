import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { loginWithGitHub } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const hasFired = useRef(false);

    useEffect(() => {
        if (hasFired.current) return;
        hasFired.current = true;

        const code = searchParams.get('code');
        if (!code) {
            setTimeout(() => setError('No authorization code received.'), 0);
            return;
        }

        loginWithGitHub(code)
            .then((res) => {
                login(res.data.token, res.data.user);
                navigate('/dashboard', { replace: true });
            })
            .catch((err) => {
                setError(err.response?.data?.error || 'Authentication failed.');
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (error) {
        return (
            <div className="min-h-screen bg-ds-bg text-ds-text selection:bg-ds-accent selection:text-ds-bg flex flex-col dot-grid items-center justify-center p-6">
                <div className="noise-overlay" />
                <div className="ds-panel max-w-sm w-full p-12 text-center animate-premium-fade-in border-ds-danger/20">
                    <div className="text-ds-danger text-[9px] font-black uppercase tracking-widest mb-6 opacity-60">
                        System Fault
                    </div>
                    <h2 className="text-2xl font-black text-ds-text uppercase tracking-tight mb-4">
                        Auth Failure
                    </h2>
                    <p className="ds-label mb-8 normal-case">{error}</p>
                    <Link to="/" className="btn-premium w-full flex justify-center py-4">
                        Re-initialize
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ds-bg text-ds-text selection:bg-ds-accent selection:text-ds-bg flex flex-col dot-grid items-center justify-center p-6">
            <div className="noise-overlay" />
            <div className="relative text-center animate-premium-fade-in space-y-8">
                <div className="w-10 h-10 border-2 border-ds-border border-t-ds-brand rounded-full animate-spin mx-auto" />
                <div className="space-y-2">
                    <h2 className="text-sm font-black text-ds-text uppercase tracking-[0.4em]">
                        Handshake in Progress
                    </h2>
                    <p className="ds-label opacity-40">Decrypting GitHub Identity...</p>
                </div>
            </div>
        </div>
    );
}
