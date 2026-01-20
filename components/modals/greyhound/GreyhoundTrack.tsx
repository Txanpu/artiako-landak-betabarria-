
import React from 'react';
import { Dog } from './useGreyhoundRace';

export const GreyhoundTrack: React.FC<{ dogs: Dog[]; phase: string }> = ({ dogs, phase }) => {
    return (
        <div className="flex-1 relative overflow-y-auto bg-[#2d3748]">
            <div className="relative w-full p-4 space-y-4">
                {dogs.map((dog) => (
                    <div key={dog.id} className="relative h-12 bg-black/30 rounded-full border border-slate-600 flex items-center">
                        <div className="absolute left-[20%] h-full w-px bg-slate-600/30"></div>
                        <div className="absolute left-[50%] h-full w-px bg-slate-600/30"></div>
                        <div className="absolute left-[80%] h-full w-px bg-slate-600/30"></div>
                        <div className="absolute right-4 top-0 bottom-0 w-2 bg-checkerboard opacity-50"></div>

                        <div 
                            className="absolute transition-transform will-change-transform z-10 flex flex-col items-center"
                            style={{ 
                                left: '10px', 
                                transform: `translateX(${dog.pos * (window.innerWidth < 768 ? 2.8 : 8)}px)`, 
                                transition: 'transform 0.1s linear'
                            }}
                        >
                            <div className="text-3xl relative" style={{transform: 'scaleX(-1)'}}>
                                🐕
                                <span className="absolute -top-2 -right-2 text-[10px] font-black text-white px-1 rounded-full border shadow-sm" style={{backgroundColor: dog.color}}>
                                    {dog.id + 1}
                                </span>
                            </div>
                            {dog.rank === 1 && <div className="text-xs absolute -top-4 animate-bounce">👑</div>}
                        </div>
                        
                        <div className="absolute right-2 text-xs font-bold text-slate-500">
                            {phase === 'results' && dog.rank && `#${dog.rank}`}
                            {phase === 'betting' && <span className="opacity-30">{dog.name}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
