import React from 'react';

const ChangelogModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const changes = [
        {
            title: "↕️ Reordenamiento Animado",
            desc: "Arrastra y desliza a los jugadores con nuevas animaciones fluidas para cambiar el orden de la partida."
        },
        {
            title: "📱 Optimización Táctil",
            desc: "Mejoras críticas en el control táctil para celulares, eliminando el desplazamiento horizontal indeseado."
        },
        {
            title: "🎨 Estética Tradicional Pulida",
            desc: "Ajuste visual en la planilla: ahora las jugadas de huevo se marcan con una elegante 'O' mayúscula."
        },
        {
            title: "🖱️ Cierre Inteligente",
            desc: "Ahora puedes cerrar cualquier ventana modal simplemente tocando fuera de ella (en el área oscura)."
        },
        {
            title: "🔢 Estabilidad Total",
            desc: "Sistema de IDs únicos para jugadores que evita errores al reordenar nombres duplicados o vacíos."
        }
    ];

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="wood-panel max-w-sm w-full p-6 animate-slide-up relative cursor-default"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">Novedades Versión 2.3</h2>
                <div className="w-12 h-1 bg-amber-500 mb-6"></div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                    {changes.map((change, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <h3 className="font-bold text-amber-500 text-sm mb-1">{change.title}</h3>
                            <p className="text-white/70 text-xs leading-relaxed">{change.desc}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 bg-table-green text-white font-bold rounded-lg shadow-wood hover:translate-y-[1px] active:translate-y-[3px] transition-all uppercase text-sm tracking-widest border-b border-table-greenDark"
                >
                    ¡Entendido!
                </button>
            </div>
        </div>
    );
};

export default ChangelogModal;
