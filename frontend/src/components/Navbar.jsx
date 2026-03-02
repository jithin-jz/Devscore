import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Menu, X, Trophy, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar({ children }) {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="border-b border-ds-border bg-ds-bg/60 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-[1500px] mx-auto px-4 md:px-6 h-12 md:h-14 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 shrink-0">
                    <Link to="/" className="flex items-center gap-2 md:gap-3 active:scale-95 transition-transform">
                        <div className="w-5 h-5 md:w-7 md:h-7 bg-ds-accent rounded flex items-center justify-center shadow-lg shadow-ds-accent/10">
                            <span className="text-ds-bg font-black italic text-[8px] md:text-xs">D</span>
                        </div>
                        <span className="text-[11px] md:text-[14px] font-black uppercase tracking-tighter">DevScore</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6 ml-4 border-l border-ds-border pl-6">
                        <Link to="/leaderboard" className="text-[10px] font-black uppercase tracking-widest text-ds-muted hover:text-ds-text transition-colors">
                            Leaderboard
                        </Link>
                    </nav>
                </div>

                {/* Desktop Tabs Middle */}
                <div className="hidden lg:flex flex-1 justify-center max-w-2xl px-4">
                    {children}
                </div>

                <div className="flex items-center gap-3 md:gap-4 shrink-0">
                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <Link to="/dashboard" className="w-8 h-8 rounded-lg overflow-hidden border border-ds-border hover:border-ds-accent transition-colors">
                                <img src={user.avatar_url || 'https://github.com/ghost.png'} alt="" className="w-full h-full object-cover" />
                            </Link>
                        ) : (
                            <Link to="/" className="btn-premium">Sign In</Link>
                        )}
                    </div>

                    {/* Mobile Menu Button - Smaller */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-1.5 text-ds-muted hover:text-ds-text"
                    >
                        {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Mobile Tabs Row - More Compact */}
            {children && (
                <div className="lg:hidden border-t border-ds-border bg-ds-bg/40 backdrop-blur-md">
                    <div className="max-w-full overflow-hidden">
                        {children}
                    </div>
                </div>
            )}

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-ds-border bg-ds-bg/95 backdrop-blur-xl animate-premium-fade-in absolute top-full left-0 w-full shadow-2xl z-50 overflow-hidden">
                    <div className="px-5 py-8 space-y-8">
                        {/* User Profile Header in Menu */}
                        {user && (
                            <div className="flex items-center gap-4 pb-6 border-b border-ds-border/50">
                                <div className="relative">
                                    <img
                                        src={user.avatar_url || 'https://github.com/ghost.png'}
                                        alt=""
                                        className="w-12 h-12 rounded-xl border border-ds-border object-cover"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-ds-success rounded-full border-2 border-ds-bg" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-[13px] font-black uppercase text-ds-text">{user.github_username}</div>
                                    <div className="text-[9px] font-bold text-ds-brand tracking-widest uppercase">
                                        Score: {parseFloat(user.dev_score || 0).toFixed(1)} • {user.tier || 'Baseline'}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-ds-muted block px-1">Navigation</span>
                            <div className="grid gap-2">
                                <Link
                                    to="/leaderboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-ds-accent/5 border border-ds-border hover:bg-ds-accent/10 transition-all active:scale-[0.98] group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-ds-accent/5 flex items-center justify-center border border-ds-border group-hover:border-ds-brand/30">
                                        <Trophy size={16} className="text-ds-brand" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[11px] font-black uppercase tracking-widest text-ds-text">Leaderboard</div>
                                        <div className="text-[8px] font-bold text-ds-muted uppercase tracking-tighter">Global Rankings</div>
                                    </div>
                                </Link>

                                {user ? (
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-ds-accent/5 border border-ds-border hover:bg-ds-accent/10 transition-all active:scale-[0.98] group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-ds-accent/5 flex items-center justify-center border border-ds-border group-hover:border-ds-brand/30">
                                            <LayoutDashboard size={16} className="text-ds-brand" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[11px] font-black uppercase tracking-widest text-ds-text">Dashboard</div>
                                            <div className="text-[8px] font-bold text-ds-muted uppercase tracking-tighter">Personal Analytics</div>
                                        </div>
                                    </Link>
                                ) : (
                                    <Link
                                        to="/"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-ds-accent text-ds-bg hover:brightness-110 transition-all active:scale-[0.98] group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-ds-bg/20 flex items-center justify-center">
                                            <LayoutDashboard size={16} className="text-ds-bg" />
                                        </div>
                                        <div className="flex-1 text-center">
                                            <div className="text-[11px] font-black uppercase tracking-widest">Sign In with GitHub</div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {user && (
                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-ds-danger/5 border border-ds-danger/10 hover:bg-ds-danger/10 transition-all active:scale-[0.98] group text-ds-danger"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-ds-danger/5 flex items-center justify-center border border-ds-danger/10 group-hover:bg-ds-danger/10">
                                        <LogOut size={16} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="text-[11px] font-black uppercase tracking-widest">Sign Out</div>
                                        <div className="text-[8px] font-bold text-ds-danger/60 uppercase tracking-tighter">Terminate Session</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Decorative Bottom Bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-ds-brand/20 via-ds-accent/20 to-ds-brand/20" />
                </div>
            )}
        </header>
    );
}
