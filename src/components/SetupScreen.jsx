import React from 'react';
import { Reorder, useDragControls } from 'framer-motion';

const SetupScreen = ({ tempNames, setTempNames, onStart, onShowChangelog, onShowSettings }) => {

    const addPlayer = () => setTempNames([
        ...tempNames,
        { id: Math.random().toString(36).substr(2, 9), name: '' }
    ]);

    const removePlayer = (index) => {
        if (tempNames.length <= 1) return;
        const newNames = tempNames.filter((_, i) => i !== index);
        setTempNames(newNames);
    };

    const updateName = (index, value) => {
        const n = [...tempNames];
        n[index] = { ...n[index], name: value };
        setTempNames(n);
    };

    return (
        <div className="p-4 responsive-container w-full overflow-x-hidden">
            <div className="wood-panel p-8 text-center relative overflow-hidden">
                {/* Clavos decorativos */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-table-oakDark opacity-60"></div>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-table-oakDark opacity-60"></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-table-oakDark opacity-60"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-table-oakDark opacity-60"></div>



                <h1 className="text-4xl font-black mb-1 text-white drop-shadow-md">CACHO</h1>
                <p className="text-white/80 font-medium mb-8 text-sm uppercase tracking-widest border-b border-white/20 pb-4 mx-10">Siempre Unidos</p>

                <Reorder.Group
                    axis="y"
                    values={tempNames}
                    onReorder={setTempNames}
                    className="space-y-3 mb-8 overflow-x-hidden p-1"
                >
                    {tempNames.map((player, i) => (
                        <PlayerRow
                            key={player.id}
                            player={player}
                            index={i}
                            updateName={updateName}
                            removePlayer={removePlayer}
                        />
                    ))}
                </Reorder.Group>

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
        </div>
    );
};

const PlayerRow = ({ player, index, updateName, removePlayer }) => {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={player}
            dragListener={false}
            dragControls={controls}
            className="flex gap-2 items-center w-full"
            style={{ position: 'relative', touchAction: 'none' }}
        >
            {/* Drag Handle - touch-action is critical for mobile drag controls */}
            <div
                onPointerDown={(e) => {
                    controls.start(e);
                }}
                className="bg-white/10 text-white/40 px-3 h-[50px] flex items-center justify-center rounded-lg cursor-grab active:cursor-grabbing border border-white/10 hover:bg-white/20 hover:text-white/60 transition-colors select-none shrink-0"
                style={{ touchAction: 'none' }}
                title="Arrastrar para reordenar"
            >
                <span className="text-xl select-none">⠿</span>
            </div>

            <input
                className="flex-1 paper-cell p-3 h-[50px] rounded-lg font-bold text-table-ink focus:outline-none focus:ring-4 focus:ring-table-green/30 transition-all placeholder-gray-400 min-w-0 notranslate"
                placeholder={`Jugador ${index + 1}`}
                value={player.name}
                onChange={(e) => updateName(index, e.target.value)}
                translate="no"
            />

            {/* Delete Button */}
            <button
                onClick={() => removePlayer(index)}
                className="bg-red-100 text-red-800 w-[50px] h-[50px] flex items-center justify-center rounded-lg font-bold hover:bg-red-200 transition-colors border border-red-200 shrink-0"
                title="Eliminar jugador"
            >
                ✕
            </button>
        </Reorder.Item>
    );
};

export default SetupScreen;
