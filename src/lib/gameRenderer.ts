import { GameState, Ship, Enemy, Projectile, Particle, PowerUp, EnemyType, PowerUpType } from './types';

export class GameRenderer {
  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  render(gameState: GameState) {
    this.clear();
    this.drawBackground();
    this.drawPowerUps(gameState.powerUps);
    this.drawShips(gameState.ships);
    this.drawEnemies(gameState.enemies);
    this.drawProjectiles(gameState.projectiles);
    this.drawParticles(gameState.particles);
    this.drawHUD(gameState);
  }

  private clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawBackground() {
    // Draw starfield
    const stars = 100;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    for (let i = 0; i < stars; i++) {
      const x = (i * 1234.5) % this.canvas.width;
      const y = (i * 567.8) % this.canvas.height;
      const size = ((i * 12.34) % 100) > 95 ? 2 : 1;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawShips(ships: Ship[]) {
    ships.forEach((ship, index) => {
      this.ctx.save();
      this.ctx.translate(ship.position.x, ship.position.y);
      this.ctx.rotate(ship.rotation);

      // Ship body
      this.ctx.fillStyle = index === 0 ? '#00aaff' : '#ff00aa';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      this.ctx.moveTo(15, 0);
      this.ctx.lineTo(-10, -8);
      this.ctx.lineTo(-5, 0);
      this.ctx.lineTo(-10, 8);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Engine glow
      this.ctx.fillStyle = '#ff8800';
      this.ctx.beginPath();
      this.ctx.ellipse(-12, 0, 3, 2, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();

      // Health bar
      this.drawHealthBar(ship.position.x - 15, ship.position.y - 25, ship.health, ship.maxHealth, '#ff4444');
      
      // Shield bar
      if (ship.shield > 0) {
        this.drawHealthBar(ship.position.x - 15, ship.position.y - 30, ship.shield, ship.maxShield, '#4444ff');
      }
    });
  }

  private drawEnemies(enemies: Enemy[]) {
    enemies.forEach(enemy => {
      this.ctx.save();
      this.ctx.translate(enemy.position.x, enemy.position.y);
      this.ctx.rotate(enemy.rotation);

      // Different shapes for different enemy types
      switch (enemy.type) {
        case EnemyType.BASIC:
          this.ctx.fillStyle = '#ff4444';
          this.ctx.strokeStyle = '#ffffff';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.rect(-8, -8, 16, 16);
          this.ctx.fill();
          this.ctx.stroke();
          break;

        case EnemyType.FAST:
          this.ctx.fillStyle = '#ffff44';
          this.ctx.strokeStyle = '#ffffff';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(10, 0);
          this.ctx.lineTo(-10, -6);
          this.ctx.lineTo(-10, 6);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.stroke();
          break;

        case EnemyType.HEAVY:
          this.ctx.fillStyle = '#888888';
          this.ctx.strokeStyle = '#ffffff';
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.stroke();
          break;

        case EnemyType.SHOOTER:
          this.ctx.fillStyle = '#ff8844';
          this.ctx.strokeStyle = '#ffffff';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(10, 0);
          this.ctx.lineTo(-5, -10);
          this.ctx.lineTo(-10, -5);
          this.ctx.lineTo(-10, 5);
          this.ctx.lineTo(-5, 10);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.stroke();
          break;
      }

      this.ctx.restore();

      // Health bar for damaged enemies
      if (enemy.health < enemy.maxHealth) {
        this.drawHealthBar(enemy.position.x - 15, enemy.position.y - 20, enemy.health, enemy.maxHealth, '#ff4444');
      }
    });
  }

  private drawProjectiles(projectiles: Projectile[]) {
    projectiles.forEach(projectile => {
      this.ctx.fillStyle = projectile.isPlayerProjectile ? '#00ffff' : '#ff4444';
      this.ctx.shadowColor = projectile.isPlayerProjectile ? '#00ffff' : '#ff4444';
      this.ctx.shadowBlur = 5;
      
      this.ctx.beginPath();
      this.ctx.arc(projectile.position.x, projectile.position.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.shadowBlur = 0;
    });
  }

  private drawParticles(particles: Particle[]) {
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      
      this.ctx.beginPath();
      this.ctx.arc(particle.position.x, particle.position.y, particle.size * alpha, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawPowerUps(powerUps: PowerUp[]) {
    powerUps.forEach(powerUp => {
      this.ctx.save();
      this.ctx.translate(powerUp.position.x, powerUp.position.y);
      
      // Pulsing glow effect
      const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
      this.ctx.shadowBlur = 10 + pulse * 10;
      
      switch (powerUp.type) {
        case PowerUpType.HEALTH:
          this.ctx.fillStyle = '#44ff44';
          this.ctx.shadowColor = '#44ff44';
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
          this.ctx.fill();
          // Draw cross
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(-1, -4, 2, 8);
          this.ctx.fillRect(-4, -1, 8, 2);
          break;

        case PowerUpType.SHIELD:
          this.ctx.fillStyle = '#4444ff';
          this.ctx.shadowColor = '#4444ff';
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
          this.ctx.fill();
          break;

        case PowerUpType.WEAPON:
          this.ctx.fillStyle = '#ff4444';
          this.ctx.shadowColor = '#ff4444';
          this.ctx.beginPath();
          this.ctx.moveTo(0, -8);
          this.ctx.lineTo(8, 8);
          this.ctx.lineTo(-8, 8);
          this.ctx.closePath();
          this.ctx.fill();
          break;

        case PowerUpType.SPEED:
          this.ctx.fillStyle = '#ffff44';
          this.ctx.shadowColor = '#ffff44';
          this.ctx.beginPath();
          this.ctx.moveTo(8, 0);
          this.ctx.lineTo(-8, -6);
          this.ctx.lineTo(-4, 0);
          this.ctx.lineTo(-8, 6);
          this.ctx.closePath();
          this.ctx.fill();
          break;
      }

      this.ctx.restore();
    });
  }

  private drawHealthBar(x: number, y: number, current: number, max: number, color: string) {
    const width = 30;
    const height = 4;
    const percentage = current / max;

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x, y, width, height);

    // Health
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width * percentage, height);

    // Border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
  }

  private drawHUD(gameState: GameState) {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px "Space Mono", monospace';
    this.ctx.textShadow = '0 0 4px #ffffff';

    // Score
    this.ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    
    // Wave
    this.ctx.fillText(`Wave: ${gameState.wave}`, 20, 55);

    // Player stats
    gameState.ships.forEach((ship, index) => {
      if (!ship.isPlayer) return;
      
      const y = 100 + index * 120;
      const playerLabel = index === 0 ? 'Player 1' : 'Player 2';
      
      this.ctx.fillStyle = index === 0 ? '#00aaff' : '#ff00aa';
      this.ctx.fillText(playerLabel, 20, y);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(`Health: ${Math.ceil(ship.health)}/${ship.maxHealth}`, 20, y + 20);
      this.ctx.fillText(`Shield: ${Math.ceil(ship.shield)}/${ship.maxShield}`, 20, y + 40);
      this.ctx.fillText(`Weapon: ${ship.upgrades.weaponDamage.toFixed(1)}x`, 20, y + 60);
      this.ctx.fillText(`Speed: ${ship.upgrades.speed.toFixed(1)}x`, 20, y + 80);
    });

    // Controls info
    this.ctx.font = '12px "Space Mono", monospace';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const bottomY = this.canvas.height - 60;
    this.ctx.fillText('Player 1: WASD + Mouse', 20, bottomY);
    this.ctx.fillText('Player 2: Arrow Keys + Space', 20, bottomY + 20);
    this.ctx.fillText('ESC: Pause', 20, bottomY + 40);
  }
}