import React from 'react';

const SettingsModal = ({ isOpen, onClose, settings, onUpdateSetting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="wood-panel max-w-sm w-full p-6 animate-slide-up relative border-2 border-white/20">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter flex items-center gap-2">
                    <span className="text-amber-500">⚙️</span> Ajustes
                </h2>
                <div className="w-12 h-1 bg-amber-500 mb-6"></div>

                <div className="space-y-6">
                    <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm">Estilo de Anotación</span>
                            <span className="text-white/40 text-[10px] uppercase font-medium tracking-wider">¿Cómo quieres ver tus puntos?</span>
                        </div>
                        <select
                            value={settings.notationStyle}
                            onChange={(e) => onUpdateSetting('notationStyle', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm font-bold focus:outline-none focus:border-amber-500 transition-colors cursor-pointer appearance-none"
                        >
                            <option value="modern" className="bg-table-oakDark">1️⃣ Moderno (Números)</option>
                            <option value="traditional" className="bg-table-oakDark">💵 Tradicional ($, 0)</option>
                            <option value="emoji" className="bg-table-oakDark">✋ Emoji (🖐🏼, 🥚)</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-8 py-3 bg-table-oakDark text-white font-bold rounded-lg shadow-wood hover:translate-y-[1px] active:translate-y-[3px] transition-all uppercase text-sm tracking-widest border border-white/10"
                >
                    Guardar y Cerrar
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
