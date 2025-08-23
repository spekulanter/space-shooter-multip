import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Ship, ShipUpgrades } from '@/lib/types';
import { Sword, Zap, Gauge, Shield, ArrowRight, RotateCcw } from '@phosphor-icons/react';

interface UpgradeMenuProps {
  ships: Ship[];
  availablePoints: number;
  onUpgrade: (shipId: string, upgradeType: keyof ShipUpgrades) => void;
  onContinue: () => void;
  onRetry: () => void;
  isGameOver?: boolean;
  finalScore?: number;
}

export function UpgradeMenu({ 
  ships, 
  availablePoints, 
  onUpgrade, 
  onContinue, 
  onRetry, 
  isGameOver = false,
  finalScore = 0
}: UpgradeMenuProps) {
  const playerShips = ships.filter(ship => ship.isPlayer);

  const getUpgradeCost = (currentLevel: number): number => {
    return Math.floor(10 + currentLevel * 5);
  };

  const upgrades = [
    {
      key: 'weaponDamage' as keyof ShipUpgrades,
      name: 'Weapon Damage',
      icon: Sword,
      description: 'Increase projectile damage',
      format: (value: number) => `${value.toFixed(1)}x`
    },
    {
      key: 'fireRate' as keyof ShipUpgrades,
      name: 'Fire Rate',
      icon: Zap,
      description: 'Shoot faster',
      format: (value: number) => `${value.toFixed(1)}/sec`
    },
    {
      key: 'speed' as keyof ShipUpgrades,
      name: 'Speed',
      icon: Gauge,
      description: 'Move faster',
      format: (value: number) => `${value.toFixed(1)}x`
    },
    {
      key: 'shieldCapacity' as keyof ShipUpgrades,
      name: 'Shield Capacity',
      icon: Shield,
      description: 'Increase maximum shield',
      format: (value: number) => `${value.toFixed(1)}x`
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center mb-6">
        {isGameOver ? (
          <>
            <h1 className="text-4xl font-bold text-destructive mb-2">GAME OVER</h1>
            <p className="text-xl text-foreground">Final Score: {finalScore.toLocaleString()}</p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-accent mb-2">WAVE COMPLETE</h1>
            <p className="text-xl text-foreground">Upgrade Your Ship</p>
          </>
        )}
        
        <div className="mt-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Available Points: {availablePoints}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 w-full max-w-4xl">
        {playerShips.map((ship, shipIndex) => (
          <Card key={ship.id} className="bg-card/80 backdrop-blur-sm border-accent/20">
            <CardHeader>
              <CardTitle className="text-center">
                {shipIndex === 0 ? 'Player 1' : 'Player 2'} - Level {ship.upgrades.level}
              </CardTitle>
              <div className="flex justify-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  Health: {ship.health}/{ship.maxHealth}
                </div>
                <div className="text-sm text-muted-foreground">
                  Shield: {Math.ceil(ship.shield)}/{ship.maxShield}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upgrades.map(upgrade => {
                  const currentValue = ship.upgrades[upgrade.key] as number;
                  const cost = getUpgradeCost(Math.floor(currentValue * 10));
                  const canAfford = availablePoints >= cost;
                  const Icon = upgrade.icon;

                  return (
                    <div key={upgrade.key} className="p-4 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon size={20} className="text-accent" />
                          <span className="font-semibold">{upgrade.name}</span>
                        </div>
                        <Badge variant={canAfford ? "default" : "secondary"}>
                          {upgrade.format(currentValue)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {upgrade.description}
                      </p>
                      
                      <div className="mb-3">
                        <Progress 
                          value={(currentValue - 1) * 50} 
                          className="h-2"
                        />
                      </div>
                      
                      <Button
                        onClick={() => onUpgrade(ship.id, upgrade.key)}
                        disabled={!canAfford || isGameOver}
                        size="sm"
                        className="w-full"
                        variant={canAfford ? "default" : "secondary"}
                      >
                        Upgrade ({cost} pts)
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex space-x-4">
        {isGameOver ? (
          <Button
            onClick={onRetry}
            size="lg"
            className="bg-primary hover:bg-primary/80 text-primary-foreground px-8"
          >
            <RotateCcw className="mr-2" size={20} />
            Play Again
          </Button>
        ) : (
          <Button
            onClick={onContinue}
            size="lg"
            className="bg-accent hover:bg-accent/80 text-accent-foreground px-8"
          >
            Continue
            <ArrowRight className="ml-2" size={20} />
          </Button>
        )}
      </div>
    </div>
  );
}