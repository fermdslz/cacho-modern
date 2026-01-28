import React from 'react';

const ChangelogModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const changes = [
        {
            title: "📡 Sincronización en Tiempo Real",
            desc: "Ahora puedes crear salas (Host) y compartir el código para que otros se unan como Espectadores."
        },
        {
            title: "💾 Persistencia de Sesión",
            desc: "La app recuerda tu sala y tus nombres aunque refresques o salgas del navegador accidentalmente."
        },
        {
            title: "📱 Diseño Ultra-Responsive",
            desc: "Mejoras para iPhone (Notch support) y escalado automático para pantallas pequeñas."
        },
        {
            title: "⚡ Flujo de Juego Rápido",
            desc: "Empieza una nueva partida conservando los nombres de los jugadores automáticamente."
        },
        {
            title: "🚪 Control de Sala",
            desc: "Botón para salir de la sala con confirmación y borrar la memoria local."
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="wood-panel max-w-sm w-full p-6 animate-slide-up relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">Novedades Ver. 2.1</h2>
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
