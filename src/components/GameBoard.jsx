import React from 'react';

const GameBoard = ({ players, activeTab, setActiveTab, onCellClick, onFinishGame, onResetGame, onOpenHistory }) => {

    const currentPlayer = players[activeTab];
    const scrollContainer = React.useRef(null);
    const isDragging = React.useRef(false);
    const startX = React.useRef(0);
    const scrollLeft = React.useRef(0);

    const handleMouseDown = (e) => {
        isDragging.current = true;
        startX.current = e.pageX - scrollContainer.current.offsetLeft;
        scrollLeft.current = scrollContainer.current.scrollLeft;

        scrollContainer.current.classList.add('cursor-grabbing');
        scrollContainer.current.classList.remove('cursor-grab');

        // Attach global listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const stopDragging = () => {
        isDragging.current = false;
        if (scrollContainer.current) {
            scrollContainer.current.classList.remove('cursor-grabbing');
            scrollContainer.current.classList.add('cursor-grab');
        }

        // Remove global listeners
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseUp = () => {
        stopDragging();
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;

        // Safety check: if mouse button is not pressed (1), stop dragging
        if ((e.buttons & 1) === 0) {
            stopDragging();
            return;
        }

        e.preventDefault();
        const x = e.pageX - scrollContainer.current.offsetLeft;
        const walk = (x - startX.current) * 2;
        scrollContainer.current.scrollLeft = scrollLeft.current - walk;
    };

    const renderCell = (pos, label, type) => {
        const val = currentPlayer.score[pos];
        const isSet = val !== null;
        return (
            <div
                onClick={() => onCellClick({ pos, label, type })}
                className={`h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative
                    ${isSet
                        ? 'bg-white border-2 border-table-oak shadow-sm' // Casilla llena
                        : 'bg-table-paper/90 hover:bg-white border border-gray-300 shadow-inner opacity-90' // Casilla vacía
                    }`}
            >
                <span className={`text-[10px] uppercase font-bold mb-1 ${isSet ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
                <span className={`text-3xl font-black ${isSet ? 'text-table-ink' : 'text-transparent'}`}>
                    {val === null ? '-' : (val === 0 ? 'X' : val)}
                </span>
            </div>
        );
    };

    return (
        <div className="max-w-md mx-auto p-4 pb-[calc(8rem+env(safe-area-inset-bottom))]">

            {/* Tabs Jugadores */}
            <div
                ref={scrollContainer}
                onMouseDown={handleMouseDown}
                className="flex gap-1 overflow-x-auto mb-4 py-2 no-scrollbar pl-1 cursor-grab active:cursor-grabbing select-none"
            >
                {players.map((p, i) => (
                    <button
                        key={i}
                        onMouseUp={(e) => {
                            // Evitar click si se estaba arrastrando
                            if (isDragging.current) {
                                e.stopPropagation();
                                return;
                            }
                            setActiveTab(i);
                        }}
                        className={`px-4 py-2 rounded-t-lg font-bold whitespace-nowrap transition-all border-t-2 border-x-2 relative
                            ${activeTab === i
                                ? 'bg-[#F9F7F1] text-table-oakDark border-white shadow-lg z-10 -mb-1 pb-3'
                                : 'bg-table-oakDark/80 text-white/70 border-table-oakDark/50 hover:bg-table-oakDark'}`}
                    >
                        {p.name} <span className="ml-1 opacity-60 text-xs">({p.total})</span>
                    </button>
                ))}
            </div>

            {/* Contenedor Principal */}
            <div className="bg-[#F9F7F1] p-3 rounded-b-xl rounded-tr-xl shadow-2xl min-h-[400px]">
                <div className="grid grid-cols-3 gap-2 mb-2">
                    {renderCell('1-1', 'Balas', 'num-1')}
                    {renderCell('1-2', 'Escalera', 'major-Escalera')}
                    {renderCell('1-3', 'Cuadras', 'num-4')}

                    {renderCell('2-1', 'Tontos', 'num-2')}
                    {renderCell('2-2', 'Full', 'major-Full')}
                    {renderCell('2-3', 'Quinas', 'num-5')}

                    {renderCell('3-1', 'Trenes', 'num-3')}
                    {renderCell('3-2', 'Poker', 'major-Poker')}
                    {renderCell('3-3', 'Senas', 'num-6')}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t-2 border-dashed border-gray-300">
                    {renderCell('4-1', '1ra Grande', 'grande')}
                    {renderCell('4-2', '2da Grande', 'grande')}
                </div>
            </div>

            {/* Barra Inferior Flotante */}
            <div
                className="fixed bottom-4 left-0 w-full px-4 pointer-events-none"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="max-w-md mx-auto wood-panel p-3 flex justify-between items-center pointer-events-auto shadow-2xl border-white/10">
                    <div>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Turno de {currentPlayer.name}</p>
                        <div className="text-3xl font-black text-white">{currentPlayer.total} <span className="text-sm font-normal text-white/60">pts</span></div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onOpenHistory} className="bg-table-oakLight text-white p-3 rounded shadow-wood hover:shadow-wood-pressed hover:translate-y-[2px] transition-all border-b border-table-oak" title="Ver Historial">
                            📋
                        </button>
                        <button onClick={onFinishGame} className="bg-table-green text-white px-4 py-2 rounded shadow-wood hover:shadow-wood-pressed hover:translate-y-[2px] transition-all font-bold text-xs uppercase tracking-wide border-b border-table-greenDark">
                            Terminar
                        </button>
                        <button onClick={onResetGame} className="bg-red-800 text-white p-3 rounded shadow-wood hover:shadow-wood-pressed hover:translate-y-[2px] transition-all border-b border-red-900" title="Reiniciar App">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
