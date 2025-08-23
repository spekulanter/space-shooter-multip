import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { MainMenu } from '@/components/MainMenu';
import { GameCanvas } from '@/components/GameCanvas';
import { UpgradeMenu } from '@/components/UpgradeMenu';
import { PauseMenu } from '@/components/PauseMenu';
import { GameMode, GameStatus, Ship, ShipUpgrades } from '@/lib/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.MENU);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.SINGLE_PLAYER);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentWave, setCurrentWave] = useState(1);
  const [upgradePoints, setUpgradePoints] = useState(0);
  const [ships, setShips] = useState<Ship[]>([]);
  const [bestScore] = useKV('best-score', 0);

  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameStatus(GameStatus.PLAYING);
    setCurrentScore(0);
    setCurrentWave(1);
    setUpgradePoints(0);
    toast.success(`Starting ${mode === GameMode.SINGLE_PLAYER ? 'Single Player' : 'Multiplayer'} game!`);
  };

  const handleGameOver = (finalScore: number) => {
    setCurrentScore(finalScore);
    setUpgradePoints(Math.floor(finalScore / 100));
    setGameStatus(GameStatus.GAME_OVER);
    
    if (finalScore > bestScore) {
      toast.success(`New best score: ${finalScore.toLocaleString()}!`);
    } else {
      toast.info(`Game Over! Score: ${finalScore.toLocaleString()}`);
    }
  };

  const handlePause = () => {
    setGameStatus(GameStatus.PAUSED);
  };

  const handleResume = () => {
    setGameStatus(GameStatus.PLAYING);
  };

  const handleRestart = () => {
    setGameStatus(GameStatus.PLAYING);
    setCurrentScore(0);
    setCurrentWave(1);
    setUpgradePoints(0);
    toast.info('Game restarted!');
  };

  const handleMainMenu = () => {
    setGameStatus(GameStatus.MENU);
    setCurrentScore(0);
    setCurrentWave(1);
    setUpgradePoints(0);
    setShips([]);
  };

  const handleWaveComplete = (score: number, wave: number, playerShips: Ship[]) => {
    setCurrentScore(score);
    setCurrentWave(wave);
    setShips(playerShips);
    setUpgradePoints(prev => prev + Math.floor(score / 50));
    setGameStatus(GameStatus.UPGRADING);
    toast.success(`Wave ${wave - 1} complete! Earned upgrade points.`);
  };

  const handleUpgrade = (shipId: string, upgradeType: keyof ShipUpgrades) => {
    const ship = ships.find(s => s.id === shipId);
    if (!ship) return;

    const currentValue = ship.upgrades[upgradeType] as number;
    const cost = Math.floor(10 + currentValue * 5);

    if (upgradePoints >= cost) {
      setUpgradePoints(prev => prev - cost);
      setShips(prev => prev.map(s => {
        if (s.id === shipId) {
          const newUpgrades = { ...s.upgrades };
          (newUpgrades[upgradeType] as number) += 0.2;
          
          // Level up if significant upgrades
          const totalUpgrades = Object.values(newUpgrades).reduce((sum, val) => 
            typeof val === 'number' ? sum + val : sum, 0
          );
          newUpgrades.level = Math.floor(totalUpgrades / 4);

          // Update max values for health/shield upgrades
          if (upgradeType === 'shieldCapacity') {
            s.maxShield = Math.floor(100 * newUpgrades.shieldCapacity);
            s.shield = Math.min(s.shield, s.maxShield);
          }

          return { ...s, upgrades: newUpgrades };
        }
        return s;
      }));

      toast.success(`Upgraded ${upgradeType.replace(/([A-Z])/g, ' $1').toLowerCase()}!`);
    } else {
      toast.error('Not enough upgrade points!');
    }
  };

  const handleContinueFromUpgrade = () => {
    setGameStatus(GameStatus.PLAYING);
    toast.info(`Starting wave ${currentWave}!`);
  };

  const handleRetry = () => {
    handleStartGame(gameMode);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {gameStatus === GameStatus.MENU && (
        <MainMenu onStartGame={handleStartGame} bestScore={bestScore} />
      )}

      {gameStatus === GameStatus.PLAYING && (
        <GameCanvas
          gameMode={gameMode}
          onGameOver={handleGameOver}
          onPause={handlePause}
        />
      )}

      {gameStatus === GameStatus.PAUSED && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
          currentScore={currentScore}
          currentWave={currentWave}
        />
      )}

      {(gameStatus === GameStatus.UPGRADING || gameStatus === GameStatus.GAME_OVER) && (
        <UpgradeMenu
          ships={ships}
          availablePoints={upgradePoints}
          onUpgrade={handleUpgrade}
          onContinue={handleContinueFromUpgrade}
          onRetry={handleRetry}
          isGameOver={gameStatus === GameStatus.GAME_OVER}
          finalScore={currentScore}
        />
      )}

      <Toaster position="top-right" />
    </div>
  );
}

export default App;