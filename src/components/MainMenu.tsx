import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameMode } from '@/lib/types';
import { Play, Users, Trophy, Settings } from '@phosphor-icons/react';

interface MainMenuProps {
  onStartGame: (mode: GameMode) => void;
  bestScore: number;
}

export function MainMenu({ onStartGame, bestScore }: MainMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-accent mb-4 neon-glow pulse-glow">
          SPACE SHOOTER
        </h1>
        <p className="text-muted-foreground text-lg">
          Defend against alien invaders in this intense space battle
        </p>
      </div>

      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-accent/20">
        <CardHeader>
          <CardTitle className="text-center text-foreground">Choose Game Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => onStartGame(GameMode.SINGLE_PLAYER)}
            className="w-full h-12 bg-primary hover:bg-primary/80 text-primary-foreground"
            size="lg"
          >
            <Play className="mr-2" size={20} />
            Single Player
          </Button>

          <Button
            onClick={() => onStartGame(GameMode.LOCAL_MULTIPLAYER)}
            className="w-full h-12 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            size="lg"
          >
            <Users className="mr-2" size={20} />
            Local Multiplayer
          </Button>

          {bestScore > 0 && (
            <div className="flex items-center justify-center pt-4 border-t border-border">
              <Trophy className="mr-2 text-accent" size={20} />
              <span className="text-foreground mr-2">Best Score:</span>
              <Badge variant="secondary" className="text-accent font-bold">
                {bestScore.toLocaleString()}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
        <h3 className="font-semibold mb-2 text-foreground">How to Play</h3>
        <div className="space-y-1">
          <p><strong>Player 1:</strong> WASD to move, Mouse to aim & shoot</p>
          <p><strong>Player 2:</strong> Arrow keys to move, Space to shoot</p>
          <p><strong>Goal:</strong> Survive waves of enemies and upgrade your ship</p>
          <p className="text-accent">Collect power-ups to enhance your abilities!</p>
        </div>
      </div>
    </div>
  );
}