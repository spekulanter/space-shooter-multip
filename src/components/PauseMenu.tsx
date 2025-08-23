import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Home, RotateCcw } from '@phosphor-icons/react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  currentScore: number;
  currentWave: number;
}

export function PauseMenu({ onResume, onRestart, onMainMenu, currentScore, currentWave }: PauseMenuProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-accent/20">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-accent">PAUSED</CardTitle>
          <div className="text-center space-y-1">
            <p className="text-foreground">Score: {currentScore.toLocaleString()}</p>
            <p className="text-foreground">Wave: {currentWave}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={onResume}
            className="w-full h-12 bg-primary hover:bg-primary/80 text-primary-foreground"
            size="lg"
          >
            <Play className="mr-2" size={20} />
            Resume Game
          </Button>

          <Button
            onClick={onRestart}
            className="w-full h-12 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            size="lg"
          >
            <RotateCcw className="mr-2" size={20} />
            Restart Game
          </Button>

          <Button
            onClick={onMainMenu}
            className="w-full h-12 bg-muted hover:bg-muted/80 text-muted-foreground"
            size="lg"
          >
            <Home className="mr-2" size={20} />
            Main Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}