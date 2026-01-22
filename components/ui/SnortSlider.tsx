
import React, { useState, useRef, useEffect } from 'react';

interface Props {
    onComplete: () => void;
    disabled?: boolean;
}

export const SnortSlider: React.FC<Props> = ({ onComplete, disabled }) => {
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 100
    const [completed, setCompleted] = useState(false);
    const [showHighEffect, setShowHighEffect] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled || completed) return;
        setDragging(true);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
        if (!dragging || !containerRef.current || completed) return;

        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        
        // Padding for the thumb to stay within bounds visually
        const padding = 20; 
        const trackWidth = rect.width - (padding * 2);
        
        // Calculate position relative to track start
        let newX = clientX - rect.left - padding;
        
        // Constraints
        if (newX < 0) newX = 0;
        if (newX > trackWidth) newX = trackWidth;

        const pct = (newX / trackWidth) * 100;
        setProgress(pct);

        // Threshold to trigger (95%)
        if (pct > 95) {
            triggerComplete();
        }
    };

    const handleEnd = () => {
        if (completed) return;
        setDragging(false);
        // Snap back if not completed
        if (progress < 95) {
            setProgress(0);
        }
    };

    const triggerComplete = () => {
        setDragging(false);
        setCompleted(true);
        setProgress(100);
        
        // Trigger High Animation locally first
        setShowHighEffect(true);

        // Wait for animation then call parent
        setTimeout(() => {
            onComplete();
            // Reset after delay (if component still mounted/needed)
            setTimeout(() => {
                setShowHighEffect(false);
                setCompleted(false);
                setProgress(0);
            }, 1000);
        }, 800);
    };

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleEnd);
        } else {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [dragging]);

    return (
        <div className="relative w-full h-16 select-none mt-2 group touch-none">
            {/* Main Track Container */}
            <div 
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center"
            >
                {/* Visual Track (Background) */}
                <div className="absolute left-0 right-0 h-10 bg-gradient-to-b from-slate-800 to-black rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] border border-slate-700/30"></div>

                {/* THE LINE (White Powder) - Contained within padding */}
                <div className="absolute left-5 right-5 h-2 rounded-full overflow-hidden bg-white/10">
                    <div 
                        className="absolute top-0 right-0 h-full bg-white filter drop-shadow-[0_0_2px_rgba(255,255,255,1)]"
                        style={{ 
                            width: `${100 - progress}%`, // Shrinks from left as we go right
                            opacity: completed ? 0 : 1,
                            transition: dragging ? 'none' : 'width 0.2s ease-out'
                        }}
                    >
                        <div className="w-full h-full opacity-60 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                    </div>
                </div>

                {/* Draggable Thumb (Rolled Bill) */}
                <div 
                    className="absolute h-14 w-14 flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
                    style={{ 
                        // left: padding (20px) + (track width % * progress) - (half thumb width 28px)
                        left: `calc(20px + (100% - 40px) * ${progress / 100} - 28px)`,
                        transition: dragging ? 'none' : 'left 0.2s ease-out'
                    }}
                    onMouseDown={handleStart}
                    onTouchStart={handleStart}
                >
                    {/* Bill Emoji */}
                    <div className={`text-5xl filter drop-shadow-2xl transform transition-transform ${dragging ? 'scale-110 -rotate-12' : 'rotate-0'}`}>
                        💸
                    </div>
                    
                    {/* Sniffing Effect */}
                    {dragging && (
                        <div className="absolute -left-2 top-1/2 w-3 h-3 bg-white rounded-full blur-md opacity-80 animate-ping"></div>
                    )}
                </div>
            </div>

            {/* --- HIGH EFFECT OVERLAY --- */}
            {showHighEffect && (
                <div className="absolute -inset-10 z-50 flex items-center justify-center pointer-events-none overflow-visible">
                    <div className="animate-in zoom-in duration-300 flex flex-col items-center">
                        <div className="text-7xl animate-bounce drop-shadow-[0_0_25px_rgba(255,255,255,1)]">
                            🤪
                        </div>
                        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-pulse mt-2 shadow-black drop-shadow-md">
                            ¡SUBIDÓN!
                        </div>
                    </div>
                    <div className="absolute inset-0">
                        {Array.from({length: 16}).map((_, i) => (
                            <div 
                                key={i}
                                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-ping"
                                style={{
                                    transform: `rotate(${i * 22.5}deg) translate(80px)`,
                                    animationDelay: `${i * 0.02}s`,
                                    animationDuration: '0.6s'
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
