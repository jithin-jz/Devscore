import GithubIcon from './ui/github-icon';
import InstagramIcon from './ui/instagram-icon';
import LinkedinIcon from './ui/linkedin-icon';
import MailFilledIcon from './ui/mail-filled-icon';

export default function Footer() {
    return (
        <footer className="border-t border-ds-border bg-ds-bg-subtle/30 py-4 relative z-10">
            <div className="max-w-[1500px] mx-auto px-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-default">
                        <div className="w-5 h-5 bg-ds-accent rounded-sm flex items-center justify-center grayscale">
                            <span className="text-ds-bg font-bold italic text-[9px]">D</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tight text-ds-text">DevScore</span>
                    </div>

                    <div className="flex items-center gap-5">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-ds-muted hover:text-ds-text transition-all hover:scale-110">
                            <GithubIcon size={15} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-ds-muted hover:text-ds-text transition-all hover:scale-110">
                            <LinkedinIcon size={15} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-ds-muted hover:text-ds-text transition-all hover:scale-110">
                            <InstagramIcon size={15} />
                        </a>
                        <a href="mailto:support@devscore.io" className="text-ds-muted hover:text-ds-text transition-all hover:scale-110">
                            <MailFilledIcon size={15} />
                        </a>
                    </div>

                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-ds-muted/20">
                        &copy; 2026 DevScore
                    </p>
                </div>
            </div>
        </footer>
    );
}
