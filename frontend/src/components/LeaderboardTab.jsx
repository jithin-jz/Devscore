import { useEffect, useState } from 'react';
import { Trophy, Medal } from 'lucide-react';

export default function LeaderboardTab() {
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        // Connect to WebSocket - Ensure we use the correct backend host
        let wsUrl;
        const apiBase = import.meta.env.VITE_API_BASE || '';

        if (apiBase) {
            // If we have an API base, use its hostname and replace http with ws
            const url = new URL(apiBase);
            const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            // Koyeb uses standard ports (443/80), so keep the port if explicitly provided locally, 
            // otherwise use standard protocol ports.
            const portStr = url.port ? `:${url.port}` : '';
            wsUrl = `${protocol}//${url.hostname}${portStr}/ws/leaderboard/`;
        } else {
            // Fallback for local
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            wsUrl = `${protocol}//${window.location.hostname}:8000/ws/leaderboard/`;
        }

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('Connected to Leaderboard WebSocket');
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'leaderboard_update') {
                    setLeaders(message.data || []);
                }
            } catch (err) {
                console.error("Error parsing websocket message", err);
            }
        };

        ws.onclose = () => {
            console.log('Leaderboard WebSocket disconnected');
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div className="space-y-8 animate-premium-fade-in pb-12">
            {/* Top 3 Podium Section */}
            {leaders.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                    {/* Rank 2 */}
                    <div className="order-2 md:order-1 ds-panel h-[180px] flex flex-col justify-end items-center relative overflow-hidden group hover:border-ds-border transition-all">
                        <div className="absolute top-0 right-0 p-2 opacity-5"><Medal size={60} className="text-gray-300" /></div>
                        <div className="mb-4 relative">
                            <img src={leaders[1].avatar_url} className="w-16 h-16 rounded-xl border-2 border-gray-400/30 object-cover" />
                            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-ds-bg border border-ds-border rounded-lg flex items-center justify-center font-black text-[10px] text-gray-300">2</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[11px] font-black uppercase text-ds-text">{leaders[1].github_username}</div>
                            <div className="text-[14px] font-mono font-black text-ds-text">{parseFloat(leaders[1].dev_score).toFixed(1)}</div>
                        </div>
                    </div>

                    {/* Rank 1 */}
                    <div className="order-1 md:order-2 ds-panel h-[220px] flex flex-col justify-end items-center relative overflow-hidden border-ds-brand/20 bg-ds-brand/[0.02] group hover:border-ds-brand/40 transition-all">
                        <div className="absolute top-0 right-0 p-2 opacity-10"><Trophy size={80} className="text-ds-brand" /></div>
                        <div className="mb-6 relative scale-110">
                            <img src={leaders[0].avatar_url} className="w-20 h-20 rounded-xl border-2 border-ds-brand/40 object-cover shadow-2xl shadow-ds-brand/20" />
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Trophy size={20} className="text-ds-brand animate-bounce" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-ds-brand border border-ds-brand/40 rounded-lg flex items-center justify-center font-black text-xs text-ds-bg shadow-lg shadow-ds-brand/20">1</div>
                        </div>
                        <div className="text-center pb-2">
                            <div className="text-[13px] font-black uppercase text-ds-text tracking-tight">{leaders[0].github_username}</div>
                            <div className="text-[18px] font-mono font-black text-ds-brand">{parseFloat(leaders[0].dev_score).toFixed(1)}</div>
                        </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="order-3 ds-panel h-[160px] flex flex-col justify-end items-center relative overflow-hidden group hover:border-ds-border transition-all">
                        <div className="absolute top-0 right-0 p-2 opacity-5"><Medal size={50} className="text-amber-600" /></div>
                        <div className="mb-4 relative">
                            <img src={leaders[2].avatar_url} className="w-14 h-14 rounded-xl border-2 border-amber-600/30 object-cover" />
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-ds-bg border border-ds-border rounded-lg flex items-center justify-center font-black text-[9px] text-amber-600">3</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] font-black uppercase text-ds-text">{leaders[2].github_username}</div>
                            <div className="text-[12px] font-mono font-black text-ds-text">{parseFloat(leaders[2].dev_score).toFixed(1)}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="ds-panel p-0 overflow-hidden border-ds-border/30 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-ds-border/30">
                            {leaders.length > 0 ? (
                                leaders.map((user, idx) => (
                                    <tr key={user.id || idx} className="hover:bg-ds-accent/[0.03] transition-colors group">
                                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                                            <span className={`text-[11px] font-black font-mono ${idx < 3 ? 'text-ds-brand' : 'text-ds-muted'}`}>
                                                #{(idx + 1).toString().padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 sm:py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative shrink-0">
                                                    <img
                                                        src={user.avatar_url || 'https://github.com/ghost.png'}
                                                        alt={user.github_username}
                                                        className="w-10 h-10 rounded-xl border border-ds-border group-hover:border-ds-brand/30 transition-colors object-cover"
                                                    />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-[13px] font-black text-ds-text group-hover:text-ds-brand transition-colors tracking-tight">{user.github_username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-block px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${user.tier === 'Baseline' ? 'bg-ds-muted/5 text-ds-muted border-ds-muted/10' :
                                                user.tier === 'Proficient' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    user.tier === 'Advanced' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                        user.tier === 'Architect' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                            user.tier === 'Principal' ? 'bg-ds-brand/10 text-ds-brand border-ds-brand/20' :
                                                                'bg-ds-muted/5 text-ds-muted border-ds-muted/10'
                                                }`}>
                                                {user.tier || 'Baseline'}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[15px] font-black text-ds-text font-mono leading-none">
                                                    {parseFloat(user.dev_score || 0).toFixed(1)}
                                                </span>
                                                <span className="text-[7px] font-bold text-ds-muted uppercase tracking-tighter mt-1 opacity-60">PTS</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-40 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <div className="w-12 h-12 border-2 border-ds-brand border-t-transparent rounded-full animate-spin" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synching with Satellite Feed</p>
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-ds-muted">Establishing secure connection...</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
