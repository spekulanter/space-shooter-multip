import React, { useRef, useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { GameEngine } from '@/lib/gameEngine';
import { GameRenderer } from '@/lib/gameRenderer';
import { GameState, GameMode, GameStatus, Ship, PlayerControls } from '@/lib/types';

interface GameCanvasProps {
  gameMode: GameMode;
  onGameOver: (score: number) => void;
  onPause: () => void;
}

export function GameCanvas({ gameMode, onGameOver, onPause }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bestScore, setBestScore] = useKV('best-score', 0);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Initialize game systems
    engineRef.current = new GameEngine(canvas, ctx);
    rendererRef.current = new GameRenderer(ctx, canvas);

    // Initialize game state
    const initialState: GameState = {
      ships: createInitialShips(gameMode),
      enemies: [],
      projectiles: [],
      particles: [],
      powerUps: [],
      wave: 1,
      score: 0,
      gameMode,
      gameStatus: GameStatus.PLAYING,
      canvas: {
        width: canvas.width,
        height: canvas.height
      }
    };

    setGameState(initialState);

    // Game loop
    const gameLoop = (timestamp: number) => {
      if (!engineRef.current || !rendererRef.current) return;

      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setGameState(prevState => {
        if (!prevState || prevState.gameStatus !== GameStatus.PLAYING) return prevState;

        const newState = engineRef.current!.update(prevState, deltaTime);

        // Check win condition (wave complete)
        if (newState.enemies.length === 0 && newState.wave < 10) {
          // Start next wave after a short delay
          setTimeout(() => {
            setGameState(currentState => {
              if (!currentState) return null;
              return {
                ...currentState,
                wave: currentState.wave + 1
              };
            });
          }, 2000);
        }

        // Check game over condition
        const alivePlayers = newState.ships.filter(ship => ship.isPlayer && ship.health > 0);
        if (alivePlayers.length === 0) {
          if (newState.score > bestScore) {
            setBestScore(newState.score);
          }
          onGameOver(newState.score);
          return { ...newState, gameStatus: GameStatus.GAME_OVER };
        }

        return newState;
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Handle ESC key for pause
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameMode, bestScore, setBestScore, onGameOver, onPause]);

  // Render game
  useEffect(() => {
    if (gameState && rendererRef.current) {
      rendererRef.current.render(gameState);
    }
  }, [gameState]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <canvas
        ref={canvasRef}
        className="game-canvas border-2 border-accent neon-glow"
        style={{ cursor: 'crosshair' }}
      />
    </div>
  );
}

function createInitialShips(gameMode: GameMode): Ship[] {
  const ships: Ship[] = [];

  // Player 1
  ships.push({
    id: 'player1',
    position: { x: 200, y: 300 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    health: 100,
    maxHealth: 100,
    shield: 100,
    maxShield: 100,
    upgrades: {
      weaponDamage: 1,
      fireRate: 3,
      speed: 1,
      shieldCapacity: 1,
      level: 1
    },
    lastShotTime: 0,
    isPlayer: true,
    controls: {
      playerId: 1,
      keys: {
        up: 'w',
        down: 's',
        left: 'a',
        right: 'd',
        shoot: 'mouse'
      }
    }
  });

  // Player 2 (if multiplayer)
  if (gameMode === GameMode.LOCAL_MULTIPLAYER) {
    ships.push({
      id: 'player2',
      position: { x: 600, y: 300 },
      velocity: { x: 0, y: 0 },
      rotation: Math.PI,
      health: 100,
      maxHealth: 100,
      shield: 100,
      maxShield: 100,
      upgrades: {
        weaponDamage: 1,
        fireRate: 3,
        speed: 1,
        shieldCapacity: 1,
        level: 1
      },
      lastShotTime: 0,
      isPlayer: true,
      controls: {
        playerId: 2,
        keys: {
          up: 'arrowup',
          down: 'arrowdown',
          left: 'arrowleft',
          right: 'arrowright',
          shoot: ' '
        }
      }
    });
  }

  return ships;
}