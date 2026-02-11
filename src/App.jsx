import React, { useState, useEffect } from 'react';
import { INITIAL_SCORES } from './constants';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import WinnerScreen from './components/WinnerScreen';
import ScoreModal from './components/ScoreModal';
import HistoryModal from './components/HistoryModal';
import ConfirmModal from './components/ConfirmModal';
import RoomManager from './components/RoomManager';
import ChangelogModal from './components/ChangelogModal';
import SettingsModal from './components/SettingsModal';
import { ref, onValue, set, update } from "firebase/database";
import { db } from './firebase';

const generateRoomID = () => Math.random().toString(36).substring(2, 7).toUpperCase();

const App = () => {
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('setup');
  const [dormidaWinner, setDormidaWinner] = useState(null);
  const [tempNames, setTempNames] = useState([
    { id: Math.random().toString(36).substr(2, 9), name: '' },
    { id: Math.random().toString(36).substr(2, 9), name: '' }
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [modal, setModal] = useState(null);
  const [moveLog, setMoveLog] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'default' });

  // Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('cacho_settings');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Migration: if it was boolean from older version, convert
        if (typeof data.useTraditionalNotation === 'boolean') {
          return { notationStyle: data.useTraditionalNotation ? 'traditional' : 'modern' };
        }
        // Remove uiSize if it exists in saved settings to keep it clean
        if (data.uiSize) delete data.uiSize;
        return data;
      } catch (e) { console.error("Error reading settings", e); }
    }
    return { notationStyle: 'traditional' };
  });

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('cacho_settings', JSON.stringify(newSettings));
  };

  // Room State
  const [roomID, setRoomID] = useState(() => localStorage.getItem('cacho_room_id') || null);
  const [role, setRole] = useState(() => localStorage.getItem('cacho_role') || null); // 'host' | 'spectator'
  const [isInitializingHost, setIsInitializingHost] = useState(false);

  // Persistence
  useEffect(() => {
    // 1. Recover standard game data
    const saved = localStorage.getItem('cacho_classic_v2');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (!roomID) { // Only load local if not in room
          setPlayers(data.players || []);
          setGameState(data.gameState || 'setup');
          setDormidaWinner(data.dormidaWinner || null);
          setMoveLog(data.moveLog || []);
        }
      } catch (e) { console.error("Error parsing saved game", e); }
    }

    // 2. Room persistence
    if (roomID) localStorage.setItem('cacho_room_id', roomID);
    else localStorage.removeItem('cacho_room_id');

    if (role) localStorage.setItem('cacho_role', role);
    else localStorage.removeItem('cacho_role');
  }, [roomID, role]);

  // Handle Host Re-entry (Fecth data before syncing)
  useEffect(() => {
    if (roomID && role === 'host' && players.length === 0) {
      console.log("Host re-conectando, verificando datos previos...");
      setIsInitializingHost(true);
      const roomRef = ref(db, `rooms/${roomID}`);
      onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.players && data.players.length > 0) {
          setPlayers(data.players);
          setGameState(data.gameState || 'playing');
          setDormidaWinner(data.dormidaWinner || null);
          setMoveLog(data.moveLog || []);
        }
        setIsInitializingHost(false);
      }, { onlyOnce: true });
    }
  }, [roomID, role]);

  useEffect(() => {
    if (players.length > 0 && !roomID) {
      localStorage.setItem('cacho_classic_v2', JSON.stringify({ players, gameState, dormidaWinner, moveLog }));
    }

    // If we are host, sync to Firebase AND Mock
    if (roomID && role === 'host' && !isInitializingHost) {
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
    const filteredNames = tempNames.filter(p => p.name.trim() !== '');
    if (filteredNames.length < 1) return alert("Añade al menos un jugador");

    const newPlayers = filteredNames.map(p => ({
      name: p.name,
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

  const handleLeaveRoom = () => {
    setConfirmConfig({
      isOpen: true,
      title: '¿ABANDONAR SALA?',
      message: role === 'host'
        ? 'Si sales como Host, la sala dejará de actualizarse para otros. ¿Estás seguro?'
        : 'Saldrás de esta partida y volverás al menú principal.',
      type: 'default',
      onConfirm: () => {
        setConfirmConfig({ isOpen: false });
        setRoomID(null);
        setRole(null);
        setGameState('setup');
        setPlayers([]);
        localStorage.removeItem('cacho_room_id');
        localStorage.removeItem('cacho_role');
      }
    });
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

  const handleResetApp = () => {
    // Si hay jugadores actuales, guardamos sus nombres para la siguiente partida
    if (players.length > 0) {
      setTempNames(players.map(p => ({ id: Math.random().toString(36).substr(2, 9), name: p.name })));
    } else {
      setTempNames([
        { id: Math.random().toString(36).substr(2, 9), name: '' },
        { id: Math.random().toString(36).substr(2, 9), name: '' }
      ]);
    }
    setPlayers([]);
    setGameState('setup');
    setDormidaWinner(null);
    setMoveLog([]);
    setActiveTab(0);
    setRoomID(null);
    setRole(null);
    localStorage.removeItem('cacho_classic_v2');
    localStorage.removeItem('cacho_room_id');
    localStorage.removeItem('cacho_role');
  };

  const resetGameHard = () => {
    setConfirmConfig({
      isOpen: true,
      title: '¡BORRÓN Y CUENTA NUEVA!',
      message: '¿Estás seguro de reiniciar? Se perderá el progreso actual.',
      type: 'default',
      onConfirm: () => {
        setConfirmConfig({ isOpen: false });
        handleResetApp();
      }
    });
  };

  const startNewGame = () => {
    handleResetApp();
  };

  return (
    <div className="min-h-dvh flex flex-col overflow-hidden">
      {gameState === 'setup' && (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-[env(safe-area-inset-bottom)] flex flex-col justify-center">
          <div className="responsive-container px-4 w-full flex flex-col items-center py-4">
            <SetupScreen
              tempNames={tempNames}
              setTempNames={setTempNames}
              onStart={handleStartGame}
              onShowChangelog={() => setShowChangelog(true)}
              onShowSettings={() => setShowSettings(true)}
            />
            <div className="w-full responsive-container">
              <RoomManager
                onHost={handleHost}
                onJoin={handleJoin}
                onLeave={handleLeaveRoom}
                roomID={roomID}
                role={role}
              />
              <div className="mt-8 pb-4 text-center">
                <a
                  href="https://www.instagram.com/fermdslz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mb-3 px-6 py-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-white/20 rounded-full text-white/90 hover:text-white text-xs tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20 backdrop-blur-sm"
                  title="Seguir en Instagram"
                  translate="no"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span className="font-light">By: Fernando Machicado</span>
                  </span>
                </a>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-white/80 font-light text-xs tracking-widest leading-none">Ver. 2.3</p>
                  <button
                    onClick={() => setShowChangelog(true)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-amber-500 hover:bg-white/20 transition-all text-[10px] font-bold border border-white/5"
                    title="Ver novedades"
                  >
                    i
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 transition-all text-[10px] font-bold border border-white/5"
                    title="Ajustes"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {players.length > 0 ? (
              <>
                {roomID && (
                  <div className="px-4 mt-4 responsive-container w-full text-center">
                    <RoomManager
                      roomID={roomID}
                      role={role}
                      onLeave={handleLeaveRoom}
                    />
                  </div>
                )}
                <GameBoard
                  players={players}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onCellClick={role === 'spectator' ? () => { } : setModal}
                  onFinishGame={finishGameManual}
                  onResetGame={resetGameHard}
                  onOpenHistory={() => setShowHistory(true)}
                  onOpenSettings={() => setShowSettings(true)}
                  isSpectator={role === 'spectator'}
                  notationStyle={settings.notationStyle}
                />
              </>
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
        </div>
      )}

      {gameState === 'finished' && (
        <WinnerScreen
          players={players}
          dormidaWinner={dormidaWinner}
          onReset={startNewGame}
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
      {showChangelog && (
        <ChangelogModal
          isOpen={showChangelog}
          onClose={() => setShowChangelog(false)}
        />
      )}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
      />
    </div>
  );
};

export default App;
