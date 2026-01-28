import React, { useState } from 'react';

const RoomManager = ({ onHost, onJoin, onLeave, roomID, role }) => {
    const [inputRoomID, setInputRoomID] = useState('');

    if (roomID) {
        return (
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col items-start px-1 min-w-fit">
                    <p className="text-white/40 text-[8px] uppercase font-bold tracking-widest">Sala Permanente</p>
                    <span className="text-xl font-black text-white tracking-widest leading-none">{roomID}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[9px] uppercase font-black transition-all shadow-lg ${role === 'host' ? 'bg-amber-400 text-black shadow-amber-500/20' : 'bg-blue-500 text-white shadow-blue-500/20'}`}>
                        {role === 'host' ? 'Host' : 'Espectador'}
                    </span>
                    <button
                        onClick={onLeave}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-lg transition-all active:scale-90 border border-red-500/30"
                        title="Salir de la sala"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </button>
                    {role === 'host' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 mt-4">
            <div className="text-center">
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mb-3">Opciones de Sala</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Host Action */}
                <button
                    onClick={onHost}
                    className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-95 group"
                >
                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">👥</span>
                    <span className="text-[10px] font-black text-white/80 uppercase">Crear Sala</span>
                </button>

                {/* Join Action (Trigger input) */}
                <div className="flex flex-col items-center justify-center p-2 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex w-full gap-1">
                        <input
                            type="text"
                            placeholder="CÓDIGO"
                            value={inputRoomID}
                            onChange={(e) => setInputRoomID(e.target.value.toUpperCase())}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-2 py-2 text-xs text-white text-center font-mono focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                        <button
                            onClick={() => onJoin(inputRoomID)}
                            disabled={!inputRoomID.trim()}
                            className="p-2 bg-blue-500/80 hover:bg-blue-400 disabled:opacity-30 text-white rounded-xl transition-all active:scale-90"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </button>
                    </div>
                    <span className="text-[10px] font-black text-white/50 uppercase mt-2">Unirse</span>
                </div>
            </div>
        </div>
    );
};

export default RoomManager;
