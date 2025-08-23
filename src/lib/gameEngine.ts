import { Vector2, Ship, Enemy, Projectile, GameState, EnemyType, PowerUpType, PowerUp, Particle } from './types';

export class GameEngine {
  private lastTime = 0;
  private keys = new Set<string>();
  private mousePosition: Vector2 = { x: 0, y: 0 };
  private mousePressed = false;

  constructor(private canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      e.preventDefault();
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
      e.preventDefault();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    });

    this.canvas.addEventListener('mousedown', () => {
      this.mousePressed = true;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mousePressed = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  update(gameState: GameState, deltaTime: number): GameState {
    const newState = { ...gameState };

    this.updateShips(newState, deltaTime);
    this.updateEnemies(newState, deltaTime);
    this.updateProjectiles(newState, deltaTime);
    this.updateParticles(newState, deltaTime);
    this.updatePowerUps(newState, deltaTime);
    this.checkCollisions(newState);
    this.spawnEnemies(newState);

    return newState;
  }

  private updateShips(gameState: GameState, deltaTime: number) {
    gameState.ships.forEach(ship => {
      if (!ship.isPlayer) return;

      const controls = ship.controls;
      if (!controls) return;

      // Movement
      const acceleration = { x: 0, y: 0 };
      const speed = ship.upgrades.speed * 200;

      if (this.keys.has(controls.keys.up)) acceleration.y -= speed;
      if (this.keys.has(controls.keys.down)) acceleration.y += speed;
      if (this.keys.has(controls.keys.left)) acceleration.x -= speed;
      if (this.keys.has(controls.keys.right)) acceleration.x += speed;

      // Apply movement
      ship.velocity.x += acceleration.x * deltaTime;
      ship.velocity.y += acceleration.y * deltaTime;

      // Apply friction
      ship.velocity.x *= 0.9;
      ship.velocity.y *= 0.9;

      // Update position
      ship.position.x += ship.velocity.x * deltaTime;
      ship.position.y += ship.velocity.y * deltaTime;

      // Keep ship in bounds
      ship.position.x = Math.max(20, Math.min(gameState.canvas.width - 20, ship.position.x));
      ship.position.y = Math.max(20, Math.min(gameState.canvas.height - 20, ship.position.y));

      // Rotation towards mouse (for player 1) or shoot key direction (for player 2)
      if (controls.playerId === 1) {
        ship.rotation = Math.atan2(
          this.mousePosition.y - ship.position.y,
          this.mousePosition.x - ship.position.x
        );
      }

      // Shooting
      const currentTime = Date.now();
      const fireRate = ship.upgrades.fireRate;
      const canShoot = currentTime - ship.lastShotTime > (1000 / fireRate);

      let shouldShoot = false;
      if (controls.playerId === 1 && this.mousePressed) {
        shouldShoot = true;
      } else if (controls.playerId === 2 && this.keys.has(controls.keys.shoot)) {
        shouldShoot = true;
      }

      if (shouldShoot && canShoot) {
        this.createProjectile(gameState, ship);
        ship.lastShotTime = currentTime;
      }

      // Shield regeneration
      if (ship.shield < ship.maxShield) {
        ship.shield = Math.min(ship.maxShield, ship.shield + 20 * deltaTime);
      }
    });
  }

  private updateEnemies(gameState: GameState, deltaTime: number) {
    gameState.enemies.forEach(enemy => {
      // Simple AI - move towards nearest player
      const nearestPlayer = this.findNearestPlayer(gameState, enemy.position);
      if (nearestPlayer) {
        const dx = nearestPlayer.position.x - enemy.position.x;
        const dy = nearestPlayer.position.y - enemy.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          const speed = enemy.type === EnemyType.FAST ? 100 : enemy.type === EnemyType.HEAVY ? 50 : 75;
          enemy.velocity.x = (dx / distance) * speed;
          enemy.velocity.y = (dy / distance) * speed;
          enemy.rotation = Math.atan2(dy, dx);
        }

        // Shooting for shooter type enemies
        if (enemy.type === EnemyType.SHOOTER && distance < 300) {
          const currentTime = Date.now();
          if (currentTime - enemy.lastShotTime > 2000) {
            this.createEnemyProjectile(gameState, enemy, nearestPlayer);
            enemy.lastShotTime = currentTime;
          }
        }
      }

      // Update position
      enemy.position.x += enemy.velocity.x * deltaTime;
      enemy.position.y += enemy.velocity.y * deltaTime;

      // Keep enemies in bounds (with wrapping)
      if (enemy.position.x < -50) enemy.position.x = gameState.canvas.width + 50;
      if (enemy.position.x > gameState.canvas.width + 50) enemy.position.x = -50;
      if (enemy.position.y < -50) enemy.position.y = gameState.canvas.height + 50;
      if (enemy.position.y > gameState.canvas.height + 50) enemy.position.y = -50;
    });
  }

  private updateProjectiles(gameState: GameState, deltaTime: number) {
    gameState.projectiles = gameState.projectiles.filter(projectile => {
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;

      // Remove projectiles that are off-screen
      return projectile.position.x > -50 && projectile.position.x < gameState.canvas.width + 50 &&
             projectile.position.y > -50 && projectile.position.y < gameState.canvas.height + 50;
    });
  }

  private updateParticles(gameState: GameState, deltaTime: number) {
    gameState.particles = gameState.particles.filter(particle => {
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
      particle.life -= deltaTime;
      return particle.life > 0;
    });
  }

  private updatePowerUps(gameState: GameState, deltaTime: number) {
    // Power-ups don't move, just exist for collection
  }

  private checkCollisions(gameState: GameState) {
    // Projectile vs Enemy collisions
    gameState.projectiles.forEach((projectile, pIndex) => {
      if (!projectile.isPlayerProjectile) return;

      gameState.enemies.forEach((enemy, eIndex) => {
        if (this.checkCircleCollision(projectile.position, 3, enemy.position, 15)) {
          enemy.health -= projectile.damage;
          
          // Create hit particles
          this.createHitParticles(gameState, enemy.position);

          // Remove projectile
          gameState.projectiles.splice(pIndex, 1);

          // Check if enemy is dead
          if (enemy.health <= 0) {
            gameState.score += enemy.points;
            this.createExplosion(gameState, enemy.position);
            
            // Chance to drop power-up
            if (Math.random() < 0.2) {
              this.createPowerUp(gameState, enemy.position);
            }
            
            gameState.enemies.splice(eIndex, 1);
          }
        }
      });
    });

    // Enemy projectile vs Player collisions
    gameState.projectiles.forEach((projectile, pIndex) => {
      if (projectile.isPlayerProjectile) return;

      gameState.ships.forEach(ship => {
        if (!ship.isPlayer) return;

        if (this.checkCircleCollision(projectile.position, 3, ship.position, 15)) {
          const damage = 10;
          
          if (ship.shield > 0) {
            ship.shield = Math.max(0, ship.shield - damage);
          } else {
            ship.health = Math.max(0, ship.health - damage);
          }

          this.createHitParticles(gameState, ship.position);
          gameState.projectiles.splice(pIndex, 1);
        }
      });
    });

    // Enemy vs Player collisions
    gameState.enemies.forEach(enemy => {
      gameState.ships.forEach(ship => {
        if (!ship.isPlayer) return;

        if (this.checkCircleCollision(enemy.position, 15, ship.position, 15)) {
          const damage = 20;
          
          if (ship.shield > 0) {
            ship.shield = Math.max(0, ship.shield - damage);
          } else {
            ship.health = Math.max(0, ship.health - damage);
          }

          // Push enemy away
          const dx = enemy.position.x - ship.position.x;
          const dy = enemy.position.y - ship.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            enemy.position.x += (dx / distance) * 30;
            enemy.position.y += (dy / distance) * 30;
          }

          this.createHitParticles(gameState, ship.position);
        }
      });
    });

    // PowerUp vs Player collisions
    gameState.powerUps.forEach((powerUp, pIndex) => {
      gameState.ships.forEach(ship => {
        if (!ship.isPlayer) return;

        if (this.checkCircleCollision(powerUp.position, 10, ship.position, 15)) {
          this.applyPowerUp(ship, powerUp);
          gameState.powerUps.splice(pIndex, 1);
        }
      });
    });
  }

  private checkCircleCollision(pos1: Vector2, radius1: number, pos2: Vector2, radius2: number): boolean {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius1 + radius2;
  }

  private findNearestPlayer(gameState: GameState, position: Vector2): Ship | null {
    let nearest: Ship | null = null;
    let nearestDistance = Infinity;

    gameState.ships.forEach(ship => {
      if (!ship.isPlayer) return;

      const dx = ship.position.x - position.x;
      const dy = ship.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearest = ship;
        nearestDistance = distance;
      }
    });

    return nearest;
  }

  private createProjectile(gameState: GameState, ship: Ship) {
    const speed = 500;
    const projectile: Projectile = {
      id: Date.now().toString(),
      position: { ...ship.position },
      velocity: {
        x: Math.cos(ship.rotation) * speed,
        y: Math.sin(ship.rotation) * speed
      },
      damage: ship.upgrades.weaponDamage * 10,
      ownerId: ship.id,
      isPlayerProjectile: true
    };

    gameState.projectiles.push(projectile);
  }

  private createEnemyProjectile(gameState: GameState, enemy: Enemy, target: Ship) {
    const speed = 300;
    const dx = target.position.x - enemy.position.x;
    const dy = target.position.y - enemy.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const projectile: Projectile = {
      id: Date.now().toString(),
      position: { ...enemy.position },
      velocity: {
        x: (dx / distance) * speed,
        y: (dy / distance) * speed
      },
      damage: 15,
      ownerId: enemy.id,
      isPlayerProjectile: false
    };

    gameState.projectiles.push(projectile);
  }

  private createHitParticles(gameState: GameState, position: Vector2) {
    for (let i = 0; i < 5; i++) {
      const particle: Particle = {
        id: Date.now().toString() + i,
        position: { ...position },
        velocity: {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200
        },
        life: 0.5,
        maxLife: 0.5,
        color: '#ff4444',
        size: 3
      };
      gameState.particles.push(particle);
    }
  }

  private createExplosion(gameState: GameState, position: Vector2) {
    for (let i = 0; i < 15; i++) {
      const particle: Particle = {
        id: Date.now().toString() + i,
        position: { ...position },
        velocity: {
          x: (Math.random() - 0.5) * 400,
          y: (Math.random() - 0.5) * 400
        },
        life: 1,
        maxLife: 1,
        color: Math.random() > 0.5 ? '#ff8800' : '#ffff00',
        size: Math.random() * 5 + 2
      };
      gameState.particles.push(particle);
    }
  }

  private createPowerUp(gameState: GameState, position: Vector2) {
    const types = Object.values(PowerUpType);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const powerUp: PowerUp = {
      id: Date.now().toString(),
      position: { ...position },
      type,
      value: 1
    };

    gameState.powerUps.push(powerUp);
  }

  private applyPowerUp(ship: Ship, powerUp: PowerUp) {
    switch (powerUp.type) {
      case PowerUpType.HEALTH:
        ship.health = Math.min(ship.maxHealth, ship.health + 25);
        break;
      case PowerUpType.SHIELD:
        ship.shield = Math.min(ship.maxShield, ship.shield + 50);
        break;
      case PowerUpType.WEAPON:
        ship.upgrades.weaponDamage += 0.2;
        break;
      case PowerUpType.SPEED:
        ship.upgrades.speed += 0.1;
        break;
    }
  }

  private spawnEnemies(gameState: GameState) {
    const targetEnemyCount = Math.min(3 + gameState.wave, 12);
    
    if (gameState.enemies.length < targetEnemyCount) {
      this.spawnEnemy(gameState);
    }
  }

  private spawnEnemy(gameState: GameState) {
    const types = [EnemyType.BASIC, EnemyType.FAST, EnemyType.HEAVY, EnemyType.SHOOTER];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Spawn at edge of screen
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (side) {
      case 0: // top
        x = Math.random() * gameState.canvas.width;
        y = -50;
        break;
      case 1: // right
        x = gameState.canvas.width + 50;
        y = Math.random() * gameState.canvas.height;
        break;
      case 2: // bottom
        x = Math.random() * gameState.canvas.width;
        y = gameState.canvas.height + 50;
        break;
      case 3: // left
        x = -50;
        y = Math.random() * gameState.canvas.height;
        break;
      default:
        x = 0;
        y = 0;
    }

    const enemy: Enemy = {
      id: Date.now().toString(),
      position: { x, y },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      health: type === EnemyType.HEAVY ? 30 : type === EnemyType.FAST ? 10 : 20,
      maxHealth: type === EnemyType.HEAVY ? 30 : type === EnemyType.FAST ? 10 : 20,
      type,
      lastShotTime: 0,
      points: type === EnemyType.HEAVY ? 30 : type === EnemyType.SHOOTER ? 25 : type === EnemyType.FAST ? 15 : 10
    };

    gameState.enemies.push(enemy);
  }
}