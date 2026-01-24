import React, { useState, useEffect } from 'react';
import { INITIAL_SCORES } from './constants';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import WinnerScreen from './components/WinnerScreen';
import ScoreModal from './components/ScoreModal';
import HistoryModal from './components/HistoryModal';

const App = () => {
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('setup');
  const [dormidaWinner, setDormidaWinner] = useState(null);
  const [tempNames, setTempNames] = useState(['', '']);
  const [activeTab, setActiveTab] = useState(0);
  const [modal, setModal] = useState(null);
  const [moveLog, setMoveLog] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('cacho_classic_v2');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlayers(data.players || []);
        setGameState(data.gameState || 'setup');
        setDormidaWinner(data.dormidaWinner || null);
        setMoveLog(data.moveLog || []);
      } catch (e) {
        console.error("Error parsing saved game", e);
      }
    }
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem('cacho_classic_v2', JSON.stringify({ players, gameState, dormidaWinner, moveLog }));
    }
  }, [players, gameState, dormidaWinner, moveLog]);

  const handleStartGame = () => {
    const filteredNames = tempNames.filter(n => n.trim() !== '');
    if (filteredNames.length < 1) return alert("Añade al menos un jugador");

    const newPlayers = filteredNames.map(name => ({
      name,
      score: { ...INITIAL_SCORES },
      total: 0
    }));
    setPlayers(newPlayers);
    setGameState('playing');
    setDormidaWinner(null);
    setMoveLog([]); // Reset log
    setActiveTab(0);
  };

  const updateScore = (pos, value) => {
    // 1. Confirmación de Dormida
    if (value === 'DORMIDA') {
      if (!confirm("⚠️ ADVERTENCIA ⚠️\n\n¿Estás SEGURO de que es una DORMIDA?\nEsto terminará la partida inmediatamente y ganará este jugador.")) {
        return; // Cancelar si el usuario dice "Cancel"
      }
    }

    const newPlayers = [...players];
    const currentPlayer = newPlayers[activeTab];

    // 2. Guardar en Historial antes de cerrar modal (necesitamos el label)
    if (modal) {
      setMoveLog(prev => [...prev, {
        player: currentPlayer.name,
        label: modal.label,
        value: value,
        timestamp: new Date().toISOString()
      }]);
    }

    currentPlayer.score = { ...currentPlayer.score, [pos]: value };

    let total = 0;
    Object.values(currentPlayer.score).forEach(v => {
      if (typeof v === 'number') total += v;
    });
    currentPlayer.total = total;

    setPlayers(newPlayers);
    setModal(null);

    if (value === 'DORMIDA') {
      setDormidaWinner(currentPlayer.name);
      setGameState('finished');
    }
  };

  const finishGameManual = () => {
    if (confirm("¿Terminar la partida y ver resultados?")) {
      setGameState('finished');
    }
  };

  const resetGameHard = () => {
    if (confirm("¿Borrar todo y empezar nueva partida?")) {
      localStorage.removeItem('cacho_classic_v2');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen">
      {gameState === 'setup' && (
        <SetupScreen
          tempNames={tempNames}
          setTempNames={setTempNames}
          onStart={handleStartGame}
        />
      )}

      {gameState === 'playing' && (
        <GameBoard
          players={players}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCellClick={setModal}
          onFinishGame={finishGameManual}
          onResetGame={resetGameHard}
          onOpenHistory={() => setShowHistory(true)}
        />
      )}

      {gameState === 'finished' && (
        <WinnerScreen
          players={players}
          dormidaWinner={dormidaWinner}
          onReset={resetGameHard}
        />
      )}

      <ScoreModal
        modal={modal}
        onClose={() => setModal(null)}
        onUpdateScore={updateScore}
      />

      {showHistory && (
        <HistoryModal
          moveLog={moveLog}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default App;
