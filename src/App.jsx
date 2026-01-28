import React, { useState, useEffect } from 'react';
import { INITIAL_SCORES } from './constants';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import WinnerScreen from './components/WinnerScreen';
import ScoreModal from './components/ScoreModal';
import HistoryModal from './components/HistoryModal';
import ConfirmModal from './components/ConfirmModal';
import RoomManager from './components/RoomManager';
import { ref, onValue, set, update } from "firebase/database";
import { db } from './firebase';

const generateRoomID = () => Math.random().toString(36).substring(2, 7).toUpperCase();

const App = () => {
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('setup');
  const [dormidaWinner, setDormidaWinner] = useState(null);
  const [tempNames, setTempNames] = useState(['', '']);
  const [activeTab, setActiveTab] = useState(0);
  const [modal, setModal] = useState(null);
  const [moveLog, setMoveLog] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'default' });

  // Room State
  const [roomID, setRoomID] = useState(null);
  const [role, setRole] = useState(null); // 'host' | 'spectator'

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
    if (players.length > 0 && !roomID) {
      localStorage.setItem('cacho_classic_v2', JSON.stringify({ players, gameState, dormidaWinner, moveLog }));
    }

    // If we are host, sync to Firebase AND Mock
    if (roomID && role === 'host') {
      const data = { players, gameState, dormidaWinner, moveLog, activeTab, lastUpdated: new Date().toISOString() };

      // Sync Mock (Same PC)
      localStorage.setItem(`cacho_room_${roomID}`, JSON.stringify(data));

      // Sync Firebase (Cloud)
      try {
        const roomRef = ref(db, `rooms/${roomID}`);
        set(roomRef, data);
      } catch (e) { /* Ignore dummy errors */ }
    }

    // Ensure activeTab is always valid
    if (players.length > 0 && activeTab >= players.length) {
      setActiveTab(0);
    }
  }, [players, gameState, dormidaWinner, moveLog, roomID, role, activeTab]);

  // Sync logic (Firebase or Mock)
  useEffect(() => {
    if (roomID && role === 'spectator') {
      console.log(`Intentando conectar a sala: ${roomID}...`);

      // 1. INTENTO DE MOCK (LocalStorage) para pruebas en la misma PC
      const syncFromLocal = () => {
        const saved = localStorage.getItem(`cacho_room_${roomID}`);
        if (saved) {
          try {
            const data = JSON.parse(saved);
            setPlayers(data.players || []);
            setGameState(data.gameState || 'setup');
            setDormidaWinner(data.dormidaWinner || null);
            setMoveLog(data.moveLog || []);
            // REMOVED: setActiveTab synchronization for spectators 
            // to allow independent navigation
          } catch (e) { console.error("Error mock sync", e); }
        }
      };

      // Poll local storage every second as fallback
      const localInterval = setInterval(syncFromLocal, 1000);

      // 2. INTENTO DE FIREBASE (Real)
      const roomRef = ref(db, `rooms/${roomID}`);
      const unsubscribe = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPlayers(data.players || []);
          setGameState(data.gameState || 'setup');
          setDormidaWinner(data.dormidaWinner || null);
          setMoveLog(data.moveLog || []);
          // REMOVED: setActiveTab synchronization for spectators 
          // to allow independent navigation
        }
      }, (error) => {
        console.warn("Firebase no conectado (llaves dummy). Usando sync local.");
      });

      return () => {
        clearInterval(localInterval);
        unsubscribe();
      };
    }
  }, [roomID, role]);

  const handleHost = () => {
    const newID = generateRoomID();
    setRoomID(newID);
    setRole('host');
    // We keep current players/state if any
  };

  const handleJoin = (id) => {
    if (!id) return;
    setRoomID(id);
    setRole('spectator');
    // REMOVED: setGameState('playing'); 
    // We wait for data to arrive before moving from 'setup'
  };

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
      setConfirmConfig({
        isOpen: true,
        type: 'dormida',
        title: '¡EL SUEÑO DE TODO CACHERO!',
        message: '¡NO PUEDE SER! 😱 ¿Es una DORMIDA REAL? ¡Confirma para hacer historia!',
        onConfirm: () => {
          setConfirmConfig({ isOpen: false });
          processUpdateScore(pos, value);
        }
      });
      return;
    }

    processUpdateScore(pos, value);
  };

  const processUpdateScore = (pos, value) => {
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
    setConfirmConfig({
      isOpen: true,
      title: '¿CERRAMOS LA PLANILLA?',
      message: '¿Ya se cansaron? ¡Cerramos el cacho y vemos quién manda!',
      type: 'default',
      onConfirm: () => {
        setConfirmConfig({ isOpen: false });
        setGameState('finished');
      }
    });
  };

  const resetGameHard = () => {
    setConfirmConfig({
      isOpen: true,
      title: '¡BORRÓN Y CUENTA NUEVA!',
      message: '¡Mesa limpia! ¿Quién se anima a otra partidita?',
      type: 'default',
      onConfirm: () => {
        setConfirmConfig({ isOpen: false });
        localStorage.removeItem('cacho_classic_v2');
        window.location.reload();
      }
    });
  };

  return (
    <div className="min-h-screen">
      {gameState === 'setup' && (
        <div className="max-w-xl mx-auto px-4 py-8">
          <RoomManager
            onHost={handleHost}
            onJoin={handleJoin}
            roomID={roomID}
            role={role}
          />
          <SetupScreen
            tempNames={tempNames}
            setTempNames={setTempNames}
            onStart={handleStartGame}
          />
        </div>
      )}

      {gameState === 'playing' && (
        <div className="max-w-5xl mx-auto">
          {roomID && (
            <div className="px-4 pt-4">
              <RoomManager roomID={roomID} role={role} />
            </div>
          )}
          {players.length > 0 ? (
            <GameBoard
              players={players}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onCellClick={role === 'spectator' ? () => { } : setModal}
              onFinishGame={finishGameManual}
              onResetGame={resetGameHard}
              onOpenHistory={() => setShowHistory(true)}
              isSpectator={role === 'spectator'}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white p-6">
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-black text-amber-500 mb-2 uppercase tracking-tighter">Sincronizando Sala</h2>
              <p className="text-white/60 text-center max-w-xs mb-8">Obteniendo los puntos de la nube. Si tarda mucho, verifica que el Host inició la partida.</p>
              <button
                onClick={() => { setRoomID(null); setRole(null); setGameState('setup'); }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/50 text-sm transition-all"
              >
                Cancelar y Salir
              </button>
            </div>
          )}
        </div>
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

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
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
