
import React, { useState } from 'react';
import { Dog } from './useGreyhoundRace';
import { Player } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';

interface Props {
    dogs: Dog[];
    player: Player;
    onBetPlaced: (dogId: number, amount: number) => void;
}

export const GreyhoundBetting: React.FC<Props> = ({ dogs, player, onBetPlaced }) => {
    const [selectedDog, setSelectedDog] = useState<number | null>(null);
    const [betAmount, setBetAmount] = useState(100);

    return (
        <div className="bg-slate-800 p-6 border-t border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {dogs.map((dog) => (
                    <button
                        key={dog.id}
                        onClick={() => setSelectedDog(dog.id)}
                        className={`relative p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 group
                            ${selectedDog === dog.id ? 'bg-slate-700 border-yellow-400 scale-105 shadow-yellow-500/20 shadow-lg' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}
                        `}
                    >
                        <div className="w-full h-1 rounded-t absolute top-0" style={{backgroundColor: dog.color}}></div>
                        <div className="font-bold text-white text-sm">{dog.name}</div>
                        <div className="text-xs text-yellow-500 font-mono font-bold">{dog.odds}x</div>
                        
                        <div className="w-full space-y-1 mt-2 opacity-60 group-hover:opacity-100">
                            <div className="flex items-center text-[8px] text-gray-400"><span className="w-4">VEL</span><div className="h-1 bg-blue-500 rounded" style={{width: `${dog.stats.speed * 8}%`}}></div></div>
                            <div className="flex items-center text-[8px] text-gray-400"><span className="w-4">RES</span><div className="h-1 bg-green-500 rounded" style={{width: `${dog.stats.stamina * 8}%`}}></div></div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                    <label className="text-gray-400 text-sm font-bold uppercase">Tu Apuesta:</label>
                    <input 
                        type="range" 
                        min="10" 
                        max={player.money} 
                        step="10"
                        value={betAmount} 
                        onChange={(e) => setBetAmount(parseInt(e.target.value))}
                        className="w-48 accent-yellow-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <span className="text-2xl font-mono text-yellow-400 font-bold">{formatMoney(betAmount)}</span>
                </div>
                <button 
                    onClick={() => { if(selectedDog !== null) onBetPlaced(selectedDog, betAmount); }}
                    disabled={selectedDog === null}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-10 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all uppercase tracking-widest text-lg"
                >
                    ¡Apostar y Correr!
                </button>
            </div>
        </div>
    );
};
