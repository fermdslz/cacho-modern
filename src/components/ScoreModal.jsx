import React from 'react';
import { JUGADAS_MAYORES } from '../constants';

const ScoreModal = ({ modal, onClose, onUpdateScore }) => {
    if (!modal) return null;

    const { pos, label, type } = modal;

    return (
        <div className="fixed inset-0 bg-table-greenDark/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
            <div className="bg-table-paper rounded-t-2xl sm:rounded-2xl w-full max-w-xs p-6 shadow-2xl animate-slide-up border-4 border-table-oak relative">
                <h3 className="text-xl font-black mb-4 text-center text-table-ink uppercase border-b border-gray-200 pb-2">{label}</h3>

                <div className="flex flex-col gap-2">
                    {/* Basic Numbers */}
                    {type.startsWith('num') && [1, 2, 3, 4, 5].map(mult => {
                        const base = parseInt(type.split('-')[1]);
                        return (
                            <button key={mult} onClick={() => onUpdateScore(pos, base * mult)} className="bg-white py-3 rounded border-2 border-gray-200 font-black text-table-ink hover:border-table-oak hover:bg-orange-50 transition-all text-lg shadow-sm">
                                {base * mult}
                            </button>
                        );
                    })}

                    {/* Major Plays */}
                    {type.startsWith('major') && (
                        <>
                            <button onClick={() => onUpdateScore(pos, JUGADAS_MAYORES[type.split('-')[1]].mano)} className="bg-table-oak text-white py-3 rounded font-bold shadow-md hover:bg-table-oakDark">De Mano ({JUGADAS_MAYORES[type.split('-')[1]].mano})</button>
                            <button onClick={() => onUpdateScore(pos, JUGADAS_MAYORES[type.split('-')[1]].huevo)} className="bg-white text-table-oakDark border-2 border-table-oakDark py-3 rounded font-bold hover:bg-gray-50">De Huevo ({JUGADAS_MAYORES[type.split('-')[1]].huevo})</button>
                        </>
                    )}

                    {/* Grandes */}
                    {type === 'grande' && (
                        <>
                            <button onClick={() => onUpdateScore(pos, 50)} className="bg-table-oak text-white py-3 rounded font-bold shadow-md">Anotar 50</button>
                            <button onClick={() => onUpdateScore(pos, 'DORMIDA')} className="bg-black text-white py-3 rounded font-black border-2 border-black hover:bg-gray-900">
                                ★ ¡DORMIDA! ★
                            </button>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <button onClick={() => onUpdateScore(pos, 0)} className="bg-red-100 text-red-700 py-3 rounded font-bold border border-red-200 hover:bg-red-200">TACHAR (X)</button>
                        <button onClick={() => onUpdateScore(pos, null)} className="bg-gray-200 text-gray-600 py-3 rounded font-bold border border-gray-300 hover:bg-gray-300 text-sm">LIMPIAR</button>
                    </div>

                    <button onClick={onClose} className="mt-2 text-gray-400 font-bold hover:text-gray-600">Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default ScoreModal;
