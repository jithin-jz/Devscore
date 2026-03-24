import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { getAdminStats, adminDeleteUser, adminGetUserProfile } from '../lib/api';
import Navbar from '../components/Navbar';
import { Shield, Users, Activity, Target, Trash2, Eye, X } from 'lucide-react';
import ScoreCard from '../components/ScoreCard';
import ScoreBreakdownTable from '../components/ScoreBreakdownTable';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewingUser, setViewingUser] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getAdminStats();
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
                if (err.response?.status === 403 || err.response?.status === 401) {
                    window.location.href = '/admin'; // Redirect back to login if not admin
                }
            } finally {
                setLoading(false);
            }
        };

        if (user?.is_admin) {
            fetchStats();
        } else {
            window.location.href = '/admin';
        }
    }, [user]);

    const handleDeleteUser = async (userId, githubUsername) => {
        if (!window.confirm(`Are you sure you want to permanently delete user ${githubUsername}?`)) return;

        try {
            await adminDeleteUser(userId);
            // Refresh stats after deletion
            const res = await getAdminStats();
            setStats(res.data);
        } catch (err) {
            console.error('Failed to delete user:', err);
            alert(err.response?.data?.error || 'Failed to delete user.');
        }
    };

    const handleViewUser = async (userId) => {
        setViewLoading(true);
        // Pre-set empty data to open modal right away, or wait
        try {
            const res = await adminGetUserProfile(userId);
            setViewingUser(res.data);
        } catch (err) {
            console.error('Failed to view user:', err);
            alert('Failed to load user details.');
        } finally {
            setViewLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-ds-bg flex flex-col items-center justify-center p-6 dot-grid">
                <div className="noise-overlay" />
                <div className="w-10 h-10 border-2 border-white/5 border-t-white rounded-full animate-spin mx-auto" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ds-bg text-ds-text selection:bg-white selection:text-black flex flex-col dot-grid">
            <div className="noise-overlay" />

            <Navbar>
                <div className="hidden md:flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-ds-brand tracking-widest border border-ds-brand/20 bg-ds-brand/10 px-3 py-1 rounded">
                        Admin Mode Active
                    </span>
                    <button onClick={logout} className="btn-subtle text-[9px] py-1.5 px-4 text-ds-danger border-ds-danger/20 hover:bg-ds-danger/10">
                        Exit
                    </button>
                </div>
            </Navbar>

            <main className="max-w-[1500px] mx-auto w-full px-6 py-8 flex-1 flex flex-col gap-8 animate-premium-fade-in relative z-10">


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="ds-panel flex flex-col gap-4">
                        <div className="flex items-center justify-between opacity-50">
                            <span className="ds-label">Total Users</span>
                            <Users size={16} />
                        </div>
                        <div className="text-4xl font-black text-white">{stats?.total_users || 0}</div>
                    </div>

                    <div className="ds-panel flex flex-col gap-4">
                        <div className="flex items-center justify-between opacity-50">
                            <span className="ds-label">Avg Platform Score</span>
                            <Target size={16} />
                        </div>
                        <div className="text-4xl font-black text-ds-brand">{stats?.avg_score || 0}</div>
                    </div>

                    <div className="ds-panel flex flex-col gap-4">
                        <div className="flex items-center justify-between opacity-50">
                            <span className="ds-label">Total Scans Conducted</span>
                            <Activity size={16} />
                        </div>
                        <div className="text-4xl font-black text-white">{stats?.total_analyses || 0}</div>
                    </div>
                </div>

                <div className="ds-panel border-white/5 overflow-hidden p-0 mt-4">
                    <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-black/50">
                        <span className="ds-label">Recent User Profiles</span>
                    </header>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-ds-muted">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Current Tier</th>
                                    <th className="px-6 py-4">DevScore</th>
                                    <th className="px-6 py-4">Analysis Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recent_users?.map((u) => (
                                    <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={u.avatar_url || 'https://github.com/ghost.png'} alt="" className="w-8 h-8 rounded border border-white/10" />
                                                <span className="font-bold text-[12px] text-white uppercase tracking-tight">{u.github_username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] text-ds-muted font-mono">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-ds-brand bg-ds-brand/10 px-2 py-1 rounded border border-ds-brand/20">
                                                {u.tier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-[14px] text-white">{Math.round(u.dev_score || 0)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${u.analysis_status === 'complete'
                                                ? 'text-ds-success bg-ds-success/10 border-ds-success/20'
                                                : u.analysis_status === 'failed'
                                                    ? 'text-ds-danger bg-ds-danger/10 border-ds-danger/20'
                                                    : 'text-ds-muted bg-white/5 border-white/10'
                                                }`}>
                                                {u.analysis_status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] text-ds-muted font-mono">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewUser(u.id)}
                                                    className="p-2 bg-white/5 text-ds-muted hover:bg-white/10 hover:text-white rounded border border-white/10 transition-colors"
                                                    title="View Profile"
                                                    disabled={viewLoading}
                                                >
                                                    <Eye size={12} />
                                                </button>
                                                {!u.is_admin && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id, u.github_username)}
                                                        className="p-2 bg-ds-danger/10 text-ds-danger hover:bg-ds-danger hover:text-white rounded border border-ds-danger/20 transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats?.recent_users || stats.recent_users.length === 0) && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-ds-muted text-[10px] font-bold uppercase tracking-widest">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* User View Modal */}
            {viewingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="ds-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-premium-fade-in border-ds-brand/20 shadow-2xl shadow-ds-brand/5">
                        <button
                            onClick={() => setViewingUser(null)}
                            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-ds-muted hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="space-y-8">
                            <header className="flex items-start gap-6 pb-6 border-b border-white/5">
                                <img src={viewingUser.profile.avatar_url || 'https://github.com/ghost.png'} alt="" className="w-20 h-20 rounded-xl border border-white/10" />
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">{viewingUser.profile.github_username}</h2>
                                    <p className="text-[11px] text-ds-muted font-mono">{viewingUser.profile.email}</p>
                                    <div className="flex gap-3 pt-1 text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-ds-brand py-1 px-2 rounded bg-ds-brand/10 border border-ds-brand/20">Tier: {viewingUser.profile.tier}</span>
                                        <span className="text-white py-1 px-2 rounded bg-white/5 border border-white/10">Score: {Math.round(viewingUser.profile.dev_score || 0)}</span>
                                    </div>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="ds-label">Score Profile</h3>
                                    {viewingUser.score ? (
                                        <div className="bg-black/50 p-6 rounded-xl border border-white/5">
                                            <div className="space-y-4">
                                                {Object.entries(viewingUser.score).map(([key, val]) =>
                                                    !['id', 'user', 'dev_score', 'tier', 'last_calculated', 'created_at'].includes(key) && typeof val === 'number' && (
                                                        <div key={key} className="flex justify-between items-center">
                                                            <span className="text-[10px] uppercase font-bold text-ds-muted tracking-widest">{key.replace('_', ' ')}</span>
                                                            <span className="text-sm font-black text-white">{val.toFixed(1)}</span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-ds-muted uppercase tracking-widest">No score data available.</p>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <h3 className="ds-label">Recent Recommendations</h3>
                                    <div className="space-y-3">
                                        {viewingUser.recommendations && viewingUser.recommendations.length > 0 ? (
                                            viewingUser.recommendations.slice(0, 3).map(rec => (
                                                <div key={rec.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                                    <h4 className="text-[11px] font-black uppercase tracking-tight text-white hover:text-ds-brand line-clamp-1">{rec.title}</h4>
                                                    <p className="text-[9px] text-ds-muted mt-2 line-clamp-2 leading-relaxed">{rec.description}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[10px] text-ds-muted uppercase tracking-widest">No active recommendations.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
