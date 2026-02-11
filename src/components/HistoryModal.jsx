import React from 'react';

const HistoryModal = ({ moveLog, onClose }) => {
    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-table-greenDark/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="wood-panel w-full responsive-container p-6 max-h-[80vh] flex flex-col relative cursor-default"
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white/50 hover:text-white font-bold p-2"
                >✕</button>

                <h3 className="text-2xl font-black mb-4 text-center text-white drop-shadow-md uppercase tracking-wider border-b border-white/20 pb-2">
                    Historial
                </h3>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {moveLog.length === 0 ? (
                        <p className="text-center text-white/50 italic py-4">Aún no hay movimientos</p>
                    ) : (
                        [...moveLog].reverse().map((log, i) => (
                            <div key={i} className="bg-table-paper/10 p-3 rounded border border-white/10 text-white flex justify-between items-center text-sm">
                                <div>
                                    <span className="font-bold text-yellow-500">{log.player}</span>
                                    <span className="mx-2 opacity-60">anotó</span>
                                    <span className="font-bold">{log.label}</span>
                                </div>
                                <div className="font-black text-lg bg-black/20 px-2 rounded">
                                    {log.value === null ? 'LIMPIAR' : (log.value === 0 ? 'X' : log.value)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
