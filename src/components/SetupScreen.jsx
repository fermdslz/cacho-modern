import React from 'react';

const SetupScreen = ({ tempNames, setTempNames, onStart }) => {

    const addPlayer = () => setTempNames([...tempNames, '']);

    const removePlayer = (index) => {
        if (tempNames.length <= 1) return;
        const newNames = tempNames.filter((_, i) => i !== index);
        setTempNames(newNames);
    };

    const updateName = (index, value) => {
        const n = [...tempNames];
        n[index] = value;
        setTempNames(n);
    };

    return (
        <div className="p-6 max-w-md mx-auto mt-10">
            <div className="wood-panel p-8 text-center relative">
                {/* Clavos decorativos */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-table-oakDark opacity-60"></div>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-table-oakDark opacity-60"></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-table-oakDark opacity-60"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-table-oakDark opacity-60"></div>

                <h1 className="text-4xl font-black mb-1 text-white drop-shadow-md">CACHO</h1>
                <p className="text-white/80 font-medium mb-8 text-sm uppercase tracking-widest border-b border-white/20 pb-4 mx-10">Siempre Unidos</p>

                <div className="space-y-3 mb-8">
                    {tempNames.map((name, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                className="flex-1 paper-cell p-3 rounded-lg font-bold text-table-ink focus:outline-none focus:ring-4 focus:ring-table-green/30 transition-all placeholder-gray-400"
                                placeholder={`Jugador ${i + 1}`}
                                value={name}
                                onChange={(e) => updateName(i, e.target.value)}
                            />
                            <button
                                onClick={() => removePlayer(i)}
                                className="bg-red-100 text-red-800 px-4 rounded-lg font-bold hover:bg-red-200 transition-colors border border-red-200"
                            >✕</button>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={addPlayer}
                        className="w-full py-3 bg-table-oakDark/30 text-white rounded-lg font-bold hover:bg-table-oakDark/50 transition-all border border-white/20">
                        + Otro Jugador
                    </button>
                    <button
                        onClick={onStart}
                        className="w-full bg-table-green text-white font-bold py-4 rounded-lg shadow-wood hover:translate-y-[2px] hover:shadow-wood-pressed active:translate-y-[4px] active:shadow-none transition-all text-lg mt-2 border-b border-table-greenDark">
                        EMPEZAR JUEGO
                    </button>
                </div>
            </div>
            <p className="text-white/80 font-light mb-2 text-xs tracking-widest border-white/20 pt-4 mx-10 text-center">By: Fernando Machicado</p>
            <p className="text-white/80 font-light mb-2 text-xs tracking-widest text-center">Ver. 2.0 (Vite)</p>
        </div>
    );
};

export default SetupScreen;
