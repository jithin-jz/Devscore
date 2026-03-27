import { forwardRef, useImperativeHandle } from 'react';
import { motion, useAnimate } from 'motion/react';

const CopyIcon = forwardRef(
    ({ size = 24, color = 'currentColor', strokeWidth = 2, className = '' }, ref) => {
        const [scope, animate] = useAnimate();

        const start = async () => {
            await animate(
                '.front-copy',
                { x: [0, 2, 0], y: [0, 2, 0] },
                { duration: 0.3, ease: 'easeInOut' }
            );
        };

        const stop = () => {
            animate('.front-copy', { x: 0, y: 0 }, { duration: 0.2, ease: 'easeOut' });
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
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
                <motion.path
                    className="front-copy"
                    d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"
                />
            </motion.svg>
        );
    }
);

CopyIcon.displayName = 'CopyIcon';

export default CopyIcon;
