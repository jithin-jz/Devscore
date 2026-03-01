import { forwardRef, useImperativeHandle, useCallback } from "react";
import { motion, useAnimate } from "motion/react";

const InstagramIcon = forwardRef(
    (
        { size = 24, color = "currentColor", strokeWidth = 2, className = "" },
        ref,
    ) => {
        const [scope, animate] = useAnimate();

        const start = useCallback(async () => {
            animate(
                ".ig-body",
                { scale: [1, 1.05, 1] },
                { duration: 0.3, ease: "easeOut" },
            );
            await animate(
                ".ig-lens",
                { scale: [1, 1.2, 1] },
                { duration: 0.25, ease: "easeOut" },
            );
            animate(
                ".ig-dot",
                { opacity: [1, 0, 1] },
                { duration: 0.2, ease: "easeInOut" },
            );
        }, [animate]);

        const stop = useCallback(() => {
            animate(
                ".ig-body, .ig-lens, .ig-dot",
                { scale: 1, opacity: 1 },
                { duration: 0.2, ease: "easeInOut" },
            );
        }, [animate]);

        useImperativeHandle(ref, () => ({
            startAnimation: start,
            stopAnimation: stop,
        }));

        return (
            <motion.svg
                ref={scope}
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
                onHoverStart={start}
                onHoverEnd={stop}
            >
                <motion.rect
                    className="ig-body"
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    ry="5"
                    style={{ transformOrigin: "center" }}
                />
                <motion.circle
                    className="ig-lens"
                    cx="12"
                    cy="12"
                    r="4"
                    style={{ transformOrigin: "center" }}
                />
                <motion.circle
                    className="ig-dot"
                    cx="17.5"
                    cy="6.5"
                    r="0.5"
                    fill={color}
                />
            </motion.svg>
        );
    },
);

InstagramIcon.displayName = "InstagramIcon";
export default InstagramIcon;
