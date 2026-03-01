import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Navbar({ children }) {
    const { user } = useAuth();

    return (
        <header className="border-b border-ds-border bg-ds-bg/60 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-[1500px] mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
                        <div className="w-7 h-7 bg-ds-accent rounded flex items-center justify-center">
                            <span className="text-ds-bg font-black italic text-xs">D</span>
                        </div>
                        <span className="text-[14px] font-black uppercase tracking-tighter">DevScore</span>
                    </Link>

                    {children}
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <Link to="/dashboard" className="w-8 h-8 rounded-lg overflow-hidden border border-ds-border hover:border-ds-accent transition-colors">
                            <img src={user.avatar_url || 'https://github.com/ghost.png'} alt="" className="w-full h-full object-cover" />
                        </Link>
                    ) : (
                        <Link to="/" className="btn-premium">Sign In</Link>
                    )}
                </div>
            </div>
        </header>
    );
}
