import { forwardRef, useImperativeHandle } from 'react';
import { motion, useAnimate } from 'motion/react';

const LayoutDashboardIcon = forwardRef(
    ({ size = 20, className = '', strokeWidth = 2, color = 'currentColor' }, ref) => {
        const [scope, animate] = useAnimate();

        const start = async () => {
            animate('.rect-1', { x: 2, y: 2 }, { duration: 0.3, ease: 'easeInOut' });
            animate('.rect-2', { x: -2, y: 2 }, { duration: 0.3, ease: 'easeInOut' });
            animate('.rect-3', { x: -2, y: -2 }, { duration: 0.3, ease: 'easeInOut' });
            animate('.rect-4', { x: 2, y: -2 }, { duration: 0.3, ease: 'easeInOut' });
        };

        const stop = async () => {
            animate(
                '.rect-1, .rect-2, .rect-3, .rect-4',
                { x: 0, y: 0 },
                { duration: 0.2, ease: 'easeInOut' }
            );
        };

        useImperativeHandle(ref, () => {
            return {
                startAnimation: start,
                stopAnimation: stop,
            };
        });

        return (
            <motion.svg
                ref={scope}
                onHoverStart={start}
                onHoverEnd={stop}
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`cursor-pointer ${className}`}
            >
                <motion.rect className="rect-1" width="7" height="9" x="3" y="3" rx="1" />
                <motion.rect className="rect-2" width="7" height="5" x="14" y="3" rx="1" />
                <motion.rect className="rect-3" width="7" height="9" x="14" y="12" rx="1" />
                <motion.rect className="rect-4" width="7" height="5" x="3" y="16" rx="1" />
            </motion.svg>
        );
    }
);

LayoutDashboardIcon.displayName = 'LayoutDashboardIcon';

export default LayoutDashboardIcon;
