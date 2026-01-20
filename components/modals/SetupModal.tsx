
import React from 'react';
import { Player } from '../../types';
import { ConfigView } from './setup/ConfigView';
import { RollView } from './setup/RollView';
import { useSetupFlow } from './setup/useSetupFlow';

interface SetupModalProps {
    onStartGame: (payload: { players: Player[], logs: string[] }) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ onStartGame }) => {
    const {
        phase,
        setupHumans, setSetupHumans,
        humanConfigs, setHumanConfigs,
        numBots, setNumBots,
        rollEntries,
        startRollOff,
        confirmGameStart
    } = useSetupFlow(onStartGame);

    return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md w-full h-full p-4 animate-in fade-in duration-300">
              <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-600 max-w-md w-full relative overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Decorator Line */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
                  
                  {phase === 'config' && (
                      <ConfigView 
                        setupHumans={setupHumans}
                        setSetupHumans={setSetupHumans}
                        humanConfigs={humanConfigs}
                        setHumanConfigs={setHumanConfigs}
                        numBots={numBots}
                        setNumBots={setNumBots}
                        onStart={startRollOff}
                      />
                  )}

                  {(phase === 'rolling' || phase === 'finished') && (
                      <RollView 
                        phase={phase}
                        entries={rollEntries}
                        onConfirm={confirmGameStart}
                      />
                  )}
              </div>
          </div> 
    );
};
