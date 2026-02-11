import React from 'react';

const WinnerScreen = ({ players, dormidaWinner, onReset }) => {
    if (!players || players.length === 0) return null;
    const sortedPlayers = [...players].sort((a, b) => b.total - a.total);
    const winnerName = dormidaWinner || sortedPlayers[0].name;
    const title = dormidaWinner ? "¡DORMIDA!" : "RESULTADOS";

    return (
        <div className="p-4 flex flex-col items-center justify-center min-h-screen">
            <div className="wood-panel p-6 w-full responsive-container">
                <h1 className="text-3xl font-black text-center mb-6 text-white drop-shadow-md tracking-wider">
                    {title}
                </h1>

                <div className="bg-table-paper rounded-lg p-1 mb-6 shadow-inner">
                    <div className="text-center p-4 border-2 border-dashed border-table-oak/30 bg-white/50 rounded" translate="no">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Ganador</p>
                        <div className="text-3xl font-black text-table-oakDark">
                            {winnerName} 🏆
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-8">
                    {sortedPlayers.map((p, i) => {
                        const isWinner = p.name === winnerName;
                        return (
                            <div key={i} className={`flex justify-between items-center p-3 rounded-lg border-b-2 ${isWinner ? 'bg-white border-yellow-400 shadow-sm' : 'bg-table-oakDark/20 border-transparent text-white'}`} translate="no">
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold w-6 ${isWinner ? 'text-table-oak' : 'text-white/60'}`}>#{i + 1}</span>
                                    <span className={`font-bold ${isWinner ? 'text-table-ink' : 'text-white'}`}>
                                        {p.name} {dormidaWinner === p.name && '⚡'}
                                    </span>
                                </div>
                                <span className={`font-black text-xl ${isWinner ? 'text-table-ink' : 'text-white'}`}>{p.total}</span>
                            </div>
                        )
                    })}
                </div>

                <button onClick={onReset} className="w-full bg-table-greenDark text-white border border-white/20 py-4 rounded-lg font-bold hover:bg-table-green transition-all shadow-lg">
                    Nueva Partida
                </button>
            </div>
        </div>
    );
};

export default WinnerScreen;
