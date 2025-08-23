# Space Shooter Game - Product Requirements Document

A browser-based 2D top-down space shooter where players pilot upgradeable ships through waves of enemies with local multiplayer support.

**Experience Qualities**: 
1. **Intense** - Fast-paced action that keeps players engaged and on edge
2. **Progressive** - Meaningful ship upgrades that provide sense of advancement
3. **Competitive** - Local multiplayer battles that encourage friendly rivalry

**Complexity Level**: Light Application (multiple features with basic state)
- Game manages ship upgrades, scoring, and multiplayer sessions with persistent progress tracking

## Essential Features

**Ship Movement & Combat**
- Functionality: WASD movement, mouse aim/shoot, physics-based controls
- Purpose: Core gameplay mechanic for player agency
- Trigger: Player input (keyboard/mouse)
- Progression: Input → Ship responds → Projectile fires → Enemy takes damage → Score increases
- Success criteria: Smooth 60fps movement, responsive controls, accurate collision detection

**Enemy Wave System**
- Functionality: Progressively difficult enemy spawns with varied behaviors
- Purpose: Provides challenge escalation and replay value
- Trigger: Wave timer or all enemies defeated
- Progression: Wave starts → Enemies spawn → Player eliminates → Wave complete → Next wave begins
- Success criteria: Balanced difficulty curve, varied enemy types, clear wave progression

**Ship Upgrade System**
- Functionality: Spend points on weapon damage, fire rate, speed, shields
- Purpose: Character progression and strategic depth
- Trigger: Player selects upgrade between waves
- Progression: Earn points → Access upgrade menu → Select upgrade → Stats improve → Return to combat
- Success criteria: Meaningful choices, visible impact, persistent progression

**Local Multiplayer**
- Functionality: Two players share screen, separate controls (WASD + mouse vs arrow keys + space)
- Purpose: Social gameplay and competitive experience
- Trigger: Player selects multiplayer mode
- Progression: Mode select → Both players ready → Game starts → Shared objective → Compare scores
- Success criteria: No control conflicts, clear player identification, balanced gameplay

**Persistent Progress**
- Functionality: Save best scores, upgrade progress, unlocked ships
- Purpose: Long-term engagement and achievement tracking
- Trigger: Game completion or manual save
- Progression: Complete game → Progress calculated → Data saved → Stats displayed on restart
- Success criteria: Data persists between sessions, clear progress indicators

## Edge Case Handling

- **Rapid Fire Spam**: Rate limiting prevents performance issues
- **Screen Boundaries**: Ships bounce or wrap around edges smoothly
- **Simultaneous Deaths**: Clear winner determination in multiplayer
- **Browser Tab Switch**: Game pauses automatically to maintain fairness
- **Mobile Touch**: Responsive design adapts controls for touch devices

## Design Direction

The design should feel sleek and futuristic with dark space aesthetics, neon accents, and smooth particle effects that evoke classic arcade shooters while maintaining modern polish and clarity.

## Color Selection

Complementary (opposite colors) - Using deep space blues against bright orange/red energy effects to create high contrast and visual excitement.

- **Primary Color**: Deep Space Blue (oklch(0.2 0.1 240)) - Communicates vastness and mystery of space
- **Secondary Colors**: Void Black (oklch(0.1 0 0)) for backgrounds, Steel Gray (oklch(0.6 0.02 240)) for UI elements
- **Accent Color**: Energy Orange (oklch(0.7 0.15 60)) - High-energy highlights for weapons, explosions, and CTAs
- **Foreground/Background Pairings**: 
  - Background (Deep Space Blue): White text (oklch(1 0 0)) - Ratio 8.2:1 ✓
  - Card (Steel Gray): White text (oklch(1 0 0)) - Ratio 5.1:1 ✓
  - Primary (Deep Space Blue): White text (oklch(1 0 0)) - Ratio 8.2:1 ✓
  - Accent (Energy Orange): Black text (oklch(0.1 0 0)) - Ratio 6.8:1 ✓

## Font Selection

Typography should convey precision and technology with clean, geometric forms that enhance readability during fast-paced gameplay.

- **Typographic Hierarchy**: 
  - H1 (Game Title): Orbitron Bold/32px/tight spacing
  - H2 (UI Headers): Orbitron Medium/24px/normal spacing  
  - Body (HUD Text): Space Mono Regular/16px/relaxed spacing
  - Small (Stats): Space Mono Regular/14px/wide spacing

## Animations

Smooth, physics-based animations that enhance gameplay feedback while maintaining 60fps performance for competitive integrity.

- **Purposeful Meaning**: Particle trails communicate speed and power, explosion effects provide satisfying feedback, UI transitions feel responsive without delaying action
- **Hierarchy of Movement**: Ship movement is immediate priority, projectiles have subtle trails, UI animations are fast and subtle, background elements provide ambient motion

## Component Selection

- **Components**: Canvas for game rendering, Card components for upgrade menus, Button for game controls, Progress bars for health/shields, Badge for score display
- **Customizations**: Custom game canvas component, specialized HUD overlays, particle system integration
- **States**: Play/Pause/GameOver states with smooth transitions, upgrade menu modal states, multiplayer lobby states
- **Icon Selection**: Phosphor icons for UI (Play, Pause, Settings, Upgrade arrows), custom SVG sprites for ships and enemies
- **Spacing**: Consistent 16px base unit, tight spacing for HUD elements (8px), generous spacing for menus (24px)
- **Mobile**: Touch controls overlay on smaller screens, responsive HUD scaling, simplified upgrade interface for mobile interaction