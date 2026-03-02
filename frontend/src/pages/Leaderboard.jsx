import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeaderboardTab from '../components/LeaderboardTab';

export default function Leaderboard() {
    return (
        <div className="min-h-screen bg-ds-bg text-ds-text flex flex-col dot-grid">
            <div className="noise-overlay" />
            <Navbar />

            <main className="max-w-[1000px] mx-auto w-full px-4 md:px-6 py-8 md:py-12 flex-1 flex flex-col animate-premium-fade-in z-10">
                <LeaderboardTab />
            </main>

            <Footer />
        </div>
    );
}
