import React, { useState } from 'react';

const RoomManager = ({ onHost, onJoin, roomID, role }) => {
    const [inputRoomID, setInputRoomID] = useState('');

    if (roomID) {
        return (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 mb-6 text-center">
                <p className="text-white/60 text-sm mb-1">SALA ACTUAL</p>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-white tracking-widest">{roomID}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${role === 'host' ? 'bg-amber-400 text-black' : 'bg-blue-400 text-white'}`}>
                        {role === 'host' ? 'Host' : 'Espectador'}
                    </span>
                </div>
                {role === 'host' && (
                    <p className="text-white/40 text-xs mt-2 italic">Comparte este código para que otros se unan</p>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Host Card */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-xl p-6 rounded-2xl border border-amber-500/30 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mb-4 text-2xl">👑</div>
                <h3 className="text-xl font-bold text-white mb-2">Crear Sala</h3>
                <p className="text-white/60 text-sm mb-6">Sé el administrador de la partida. Solo tú podrás anotar puntos.</p>
                <button
                    onClick={onHost}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                >
                    HOSTEAR PARTIDA
                </button>
            </div>

            {/* Join Card */}
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl p-6 rounded-2xl border border-blue-500/30 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4 text-2xl">👀</div>
                <h3 className="text-xl font-bold text-white mb-2">Unirse a Sala</h3>
                <p className="text-white/60 text-sm mb-4">Mira los puntos en tiempo real desde tu dispositivo.</p>
                <div className="w-full flex gap-2">
                    <input
                        type="text"
                        placeholder="CÓDIGO"
                        value={inputRoomID}
                        onChange={(e) => setInputRoomID(e.target.value.toUpperCase())}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center font-mono focus:outline-none focus:border-blue-400 transition-colors"
                    />
                    <button
                        onClick={() => onJoin(inputRoomID)}
                        disabled={!inputRoomID.trim()}
                        className="px-6 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:active:scale-100 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        UNIRSE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomManager;
