// Sistema de Juego - Guerra de Roles
class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.players = [];
        this.walls = [];
        this.shields = [];
        this.currentScreen = 'mainMenu';
        this.selectedRole = null;
        this.gameRunning = false;
        this.lastTime = 0;
        this.showUltiHitbox = false;
        this.ultiHitboxAnimation = null; // {x, y, radius, time, duration}
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        // generateMap se llamará después de que el canvas esté inicializado
    }

    setupEventListeners() {
        // Menú Principal
        document.getElementById('btnCreateRoom').addEventListener('click', () => this.createRoom());
        document.getElementById('btnJoinRoom').addEventListener('click', () => this.joinRoom());
        
        // Selección de Roles
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', () => this.selectRole(card.dataset.role));
        });
        
        document.getElementById('btnReady').addEventListener('click', () => this.startGame());
        
        // Controles de Tanque
        document.getElementById('btnShield').addEventListener('click', () => this.deployShield());
        document.getElementById('btnBreakWalls').addEventListener('click', () => this.breakWalls());
        
        // Controles de DPS
        document.getElementById('weaponSelect').addEventListener('change', (e) => this.changeWeapon(e.target.value));
        
        // Controles de Soporte
        document.getElementById('btnHealAll').addEventListener('click', () => this.healAll());
        document.getElementById('btnBuffTank').addEventListener('click', () => this.buffTank());
        document.getElementById('btnBuffDPS').addEventListener('click', () => this.buffDPS());
        
        // Controles del juego
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Generar mapa después de inicializar canvas
        this.generateMap();
    }

    createRoom() {
        this.showScreen('roleSelection');
        this.team = 'A';
        this.updateRoleCounts();
    }

    joinRoom() {
        this.showScreen('roleSelection');
        this.team = 'B';
        this.updateRoleCounts();
    }

    selectRole(role) {
        const card = document.querySelector(`[data-role="${role}"]`);
        const counts = this.getCurrentCounts();
        
        // Verificar límites
        if (role === 'tank' && counts.tank >= 1) return;
        if (role === 'dps' && counts.dps >= 2) return;
        if (role === 'support' && counts.support >= 2) return;
        
        // Remover selección previa
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
        
        // Seleccionar nuevo rol
        card.classList.add('selected');
        this.selectedRole = role;
        
        // Habilitar botón de listo
        document.getElementById('btnReady').disabled = false;
    }

    getCurrentCounts() {
        // Simulación - en un juego real esto vendría del servidor
        const counts = { tank: 0, dps: 0, support: 0 };
        const selectedCards = document.querySelectorAll('.role-card.selected');
        
        selectedCards.forEach(card => {
            const role = card.dataset.role;
            if (role === 'tank') counts.tank++;
            else if (role === 'dps') counts.dps++;
            else if (role === 'support') counts.support++;
        });
        
        return counts;
    }

    updateRoleCounts() {
        const counts = this.getCurrentCounts();
        document.getElementById('tankCount').textContent = `${counts.tank}/1`;
        document.getElementById('dpsCount').textContent = `${counts.dps}/2`;
        document.getElementById('supportCount').textContent = `${counts.support}/2`;
        
        // Deshabilitar cards si están llenos
        if (counts.tank >= 1) {
            document.querySelector('[data-role="tank"]').classList.add('disabled');
        }
        if (counts.dps >= 2) {
            document.querySelector('[data-role="dps"]').classList.add('disabled');
        }
        if (counts.support >= 2) {
            document.querySelector('[data-role="support"]').classList.add('disabled');
        }
    }

    startGame() {
        if (!this.selectedRole) return;
        
        this.showScreen('gameContainer');
        this.createPlayer();
        this.createTeams();
        this.gameRunning = true;
        this.setupRoleUI();
        this.lastTime = performance.now();
        this.gameLoop();
    }

    createPlayer() {
        const spawnX = this.team === 'A' ? 100 : this.canvas.width - 100;
        const spawnY = this.canvas.height / 2;
        
        this.player = new Player(
            spawnX, 
            spawnY, 
            this.selectedRole, 
            this.team
        );
        
        this.players.push(this.player);
    }

    createTeams() {
        // Crear jugadores del equipo A (IA simulado)
        const teamARoles = ['tank', 'dps', 'dps', 'support', 'support'];
        const spawnY = this.canvas.height / 2;
        
        teamARoles.forEach((role, index) => {
            if (this.team === 'A' && role === this.selectedRole && index === 0) return;
            
            const x = 100 + (index * 60);
            const player = new Player(x, spawnY - 100 + (index * 50), role, 'A');
            if (this.team === 'A' && role === this.selectedRole) {
                player.x = this.player.x;
                player.y = this.player.y;
            } else {
                player.isAI = true;
            }
            this.players.push(player);
        });
        
        // Crear jugadores del equipo B (IA simulado)
        const teamBRoles = ['tank', 'dps', 'dps', 'support', 'support'];
        teamBRoles.forEach((role, index) => {
            const x = this.canvas.width - 100 - (index * 60);
            const player = new Player(x, spawnY - 100 + (index * 50), role, 'B');
            player.isAI = true;
            this.players.push(player);
        });
    }

    setupRoleUI() {
        // Mostrar UI según el rol
        document.querySelectorAll('.role-ui').forEach(ui => ui.classList.add('hidden'));
        
        const roleBadge = document.getElementById('playerRole');
        roleBadge.textContent = this.selectedRole.toUpperCase();
        
        if (this.selectedRole === 'tank') {
            document.getElementById('tankUI').classList.remove('hidden');
        } else if (this.selectedRole === 'dps') {
            document.getElementById('dpsUI').classList.remove('hidden');
            this.setupAccessories();
        } else if (this.selectedRole === 'support') {
            document.getElementById('supportUI').classList.remove('hidden');
            this.startHealTimer();
        }
    }

    setupAccessories() {
        const accessories = [
            { name: 'Mirilla', effect: 'precision' },
            { name: 'Cañón', effect: 'damage' },
            { name: 'Cargador', effect: 'fireRate' },
            { name: 'Silenciador', effect: 'stealth' },
            { name: 'Empuñadura', effect: 'stability' },
            { name: 'Laser', effect: 'accuracy' }
        ];
        
        const grid = document.getElementById('accessoriesGrid');
        grid.innerHTML = '';
        
        accessories.forEach(acc => {
            const item = document.createElement('div');
            item.className = 'accessory-item';
            item.textContent = acc.name;
            item.dataset.effect = acc.effect;
            item.addEventListener('click', () => this.toggleAccessory(item));
            grid.appendChild(item);
        });
    }

    toggleAccessory(item) {
        item.classList.toggle('active');
        const effect = item.dataset.effect;
        this.player.toggleAccessory(effect);
    }

    changeWeapon(weaponType) {
        this.player.changeWeapon(weaponType);
    }

    deployShield() {
        if (this.player.role !== 'tank') return;
        if (this.player.shieldCooldown > 0) return;
        
        const shield = new Shield(
            this.player.x + Math.cos(this.player.angle) * 40,
            this.player.y + Math.sin(this.player.angle) * 40,
            this.player.angle,
            300, // HP del escudo
            this.player.team
        );
        shield.owner = this.player; // Asignar propietario
        
        this.shields.push(shield);
        this.player.shieldCooldown = 5; // 5 segundos de cooldown
    }

    breakWalls() {
        if (this.player.role !== 'tank') return;
        if (this.player.ultiCharge < 100) return;
        
        // Destruir todas las paredes en un área
        const breakRadius = 200;
        
        // Iniciar animación de hitbox
        this.ultiHitboxAnimation = {
            x: this.player.x,
            y: this.player.y,
            radius: 0,
            maxRadius: breakRadius,
            time: 0,
            duration: 0.5 // 0.5 segundos de animación
        };
        
        this.walls = this.walls.filter(wall => {
            const dist = Math.sqrt(
                Math.pow(wall.x - this.player.x, 2) + 
                Math.pow(wall.y - this.player.y, 2)
            );
            return dist > breakRadius;
        });
        
        this.player.ultiCharge = 0;
        document.getElementById('btnBreakWalls').disabled = true;
        document.getElementById('tankUltiBar').textContent = '0%';
        document.getElementById('tankUltiBar').style.width = '0%';
        this.showUltiHitbox = false;
    }

    healAll() {
        if (this.player.role !== 'support') return;
        if (this.player.healCooldown > 0) return;
        
        this.players.forEach(p => {
            if (p.team === this.player.team && p !== this.player) {
                p.health = Math.min(p.maxHealth, p.health + 30);
            }
        });
        
        this.player.healCooldown = 10;
        document.getElementById('healTimer').textContent = '10';
    }

    buffTank() {
        if (this.player.role !== 'support') return;
        this.buffTeamRole('tank');
    }

    buffDPS() {
        if (this.player.role !== 'support') return;
        this.buffTeamRole('dps');
    }

    buffTeamRole(role) {
        this.players.forEach(p => {
            if (p.team === this.player.team && p.role === role) {
                p.applyBuff('damage', 1.5, 15); // +50% daño por 15 segundos
            }
        });
    }

    startHealTimer() {
        setInterval(() => {
            if (this.player.role === 'support' && this.player.healCooldown > 0) {
                this.player.healCooldown -= 1;
                document.getElementById('healTimer').textContent = this.player.healCooldown;
                
                if (this.player.healCooldown === 0) {
                    // Cura automática cada 10 segundos
                    this.healAll();
                }
            }
        }, 1000);
    }

    generateMap() {
        // Generar paredes en el mapa
        const wallCount = 15;
        const width = this.canvas?.width || window.innerWidth || 1920;
        const height = this.canvas?.height || window.innerHeight || 1080;
        
        for (let i = 0; i < wallCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const wallWidth = 20 + Math.random() * 40;
            const wallHeight = 20 + Math.random() * 40;
            
            this.walls.push({
                x: x,
                y: y,
                width: wallWidth,
                height: wallHeight
            });
        }
    }

    handleKeyDown(e) {
        if (!this.player) return;
        
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 's' || key === 'a' || key === 'd') {
            this.player.keys[key] = true;
        }
    }

    handleKeyUp(e) {
        if (!this.player) return;
        
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 's' || key === 'a' || key === 'd') {
            this.player.keys[key] = false;
        }
    }

    handleClick(e) {
        if (!this.player || !this.gameRunning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.player.role === 'tank') {
            // Tanque ataca cuerpo a cuerpo
            this.player.angle = Math.atan2(y - this.player.y, x - this.player.x);
            this.player.checkMeleeAttack(this.players);
        } else {
            // DPS y Soporte atacan a distancia
            this.player.attack(x, y);
        }
    }

    showScreen(screenName) {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('roleSelection').classList.add('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
        
        document.getElementById(screenName === 'gameContainer' ? 'gameContainer' : 
                                 screenName === 'roleSelection' ? 'roleSelection' : 
                                 'mainMenu').classList.remove('hidden');
        
        this.currentScreen = screenName;
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        if (!this.player) return;
        
        // Actualizar jugador
        this.player.update(deltaTime, this.walls, this.canvas);
        
        // Verificar ataque cuerpo a cuerpo del jugador
        if (this.player && this.player.lastAttack <= 0 && this.player.role === 'tank') {
            this.player.checkMeleeAttack(this.players);
        }
        
        // Actualizar otros jugadores (IA)
        this.players.forEach(p => {
            if (p !== this.player && p.isAI) {
                p.updateAI(deltaTime, this.players, this.walls, this.canvas);
            }
            
            // Actualizar buffs
            p.updateBuffs(deltaTime);
            
            // Actualizar cooldowns
            if (p.shieldCooldown > 0) p.shieldCooldown -= deltaTime;
            
            // Actualizar ulti del tanque
            if (p.role === 'tank' && p.ultiCharge < 100) {
                p.ultiCharge = Math.min(100, p.ultiCharge + deltaTime * 2); // 2% por segundo
                if (p === this.player) {
                    const ultiBar = document.getElementById('tankUltiBar');
                    ultiBar.style.width = p.ultiCharge + '%';
                    ultiBar.textContent = Math.floor(p.ultiCharge) + '%';
                    
                    const btn = document.getElementById('btnBreakWalls');
                    btn.disabled = p.ultiCharge < 100;
                }
            }
        });
        
        // Verificar colisiones de proyectiles
        this.players.forEach(p => {
            if (p.projectiles) {
                // Usar bucle inverso para evitar problemas al eliminar elementos
                for (let idx = p.projectiles.length - 1; idx >= 0; idx--) {
                    const proj = p.projectiles[idx];
                    proj.update(deltaTime);
                    
                    let shouldRemove = false;
                    
                    // Colisión con jugadores
                    this.players.forEach(target => {
                        if (target.team !== p.team && !target.isDead) {
                            const dist = Math.sqrt(
                                Math.pow(proj.x - target.x, 2) + 
                                Math.pow(proj.y - target.y, 2)
                            );
                            if (dist < target.radius) {
                                target.takeDamage(proj.damage);
                                shouldRemove = true;
                            }
                        }
                    });
                    
                    // Colisión con escudos
                    if (!shouldRemove) {
                        this.shields.forEach(shield => {
                            if (shield.team !== p.team) {
                                const dist = Math.sqrt(
                                    Math.pow(proj.x - shield.x, 2) + 
                                    Math.pow(proj.y - shield.y, 2)
                                );
                                if (dist < 30) {
                                    shield.takeDamage(proj.damage);
                                    shouldRemove = true;
                                }
                            }
                        });
                    }
                    
                    // Remover proyectiles fuera del mapa
                    if (!shouldRemove && (proj.x < 0 || proj.x > this.canvas.width || 
                        proj.y < 0 || proj.y > this.canvas.height)) {
                        shouldRemove = true;
                    }
                    
                    if (shouldRemove) {
                        p.projectiles.splice(idx, 1);
                    }
                }
            }
        });
        
        // Actualizar escudos
        this.shields.forEach((shield, idx) => {
            shield.update(deltaTime);
            if (shield.health <= 0) {
                this.shields.splice(idx, 1);
            }
        });
        
        // Actualizar animación de hitbox de ultimate
        if (this.ultiHitboxAnimation) {
            this.ultiHitboxAnimation.time += deltaTime;
            const progress = Math.min(this.ultiHitboxAnimation.time / this.ultiHitboxAnimation.duration, 1);
            // Animación de expansión con efecto de rebote
            this.ultiHitboxAnimation.radius = this.ultiHitboxAnimation.maxRadius * (1 - Math.pow(1 - progress, 3));
            
            if (progress >= 1) {
                this.ultiHitboxAnimation = null;
            }
        }
        
        // Mostrar hitbox cuando la ultimate está lista
        if (this.player && this.player.role === 'tank' && this.player.ultiCharge >= 100) {
            this.showUltiHitbox = true;
        } else {
            this.showUltiHitbox = false;
        }
        
        // Actualizar UI
        this.updateUI();
        
        // Verificar condición de victoria
        const teamAPlayers = this.players.filter(p => p.team === 'A' && !p.isDead);
        const teamBPlayers = this.players.filter(p => p.team === 'B' && !p.isDead);
        
        if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
            this.gameRunning = false;
            alert(teamAPlayers.length > 0 ? 'Equipo A Gana!' : 'Equipo B Gana!');
        }
    }

    updateUI() {
        if (!this.player) return;
        
        // Actualizar barra de vida
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('playerHealth').style.width = healthPercent + '%';
        document.getElementById('healthText').textContent = 
            Math.floor(this.player.health) + '/' + this.player.maxHealth;
        
        // Actualizar info de escudo
        if (this.player.role === 'tank') {
            const activeShield = this.shields.find(s => s.owner === this.player);
            if (activeShield) {
                document.getElementById('shieldHealth').classList.remove('hidden');
                document.getElementById('shieldHealthValue').textContent = Math.floor(activeShield.health);
            } else {
                document.getElementById('shieldHealth').classList.add('hidden');
            }
        }
        
        // Actualizar stats de equipos
        this.updateTeamStats();
    }

    updateTeamStats() {
        const teamA = this.players.filter(p => p.team === 'A');
        const teamB = this.players.filter(p => p.team === 'B');
        
        const teamAStats = document.getElementById('teamAStats');
        const teamBStats = document.getElementById('teamBStats');
        
        teamAStats.innerHTML = teamA.map(p => {
            const healthPercent = (p.health / p.maxHealth) * 100;
            return `<div style="margin: 5px 0;">
                ${p.role.toUpperCase()}: 
                <div style="width: 100%; height: 10px; background: rgba(255,0,0,0.2); border: 1px solid #ff0000; margin-top: 2px;">
                    <div style="height: 100%; background: #00ff00; width: ${healthPercent}%"></div>
                </div>
            </div>`;
        }).join('');
        
        teamBStats.innerHTML = teamB.map(p => {
            const healthPercent = (p.health / p.maxHealth) * 100;
            return `<div style="margin: 5px 0;">
                ${p.role.toUpperCase()}: 
                <div style="width: 100%; height: 10px; background: rgba(255,0,0,0.2); border: 1px solid #ff0000; margin-top: 2px;">
                    <div style="height: 100%; background: #00ff00; width: ${healthPercent}%"></div>
                </div>
            </div>`;
        }).join('');
    }

    render() {
        if (!this.ctx) return;
        
        // Limpiar canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar grid de fondo
        this.drawGrid();
        
        // Dibujar paredes
        this.walls.forEach(wall => {
            this.ctx.fillStyle = '#4a4a6e';
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            this.ctx.strokeStyle = '#6a6a8e';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
        });
        
        // Dibujar escudos
        this.shields.forEach(shield => {
            shield.render(this.ctx);
        });
        
        // Dibujar hitbox de ultimate del tanque (cuando está lista)
        if (this.showUltiHitbox && this.player && this.player.role === 'tank') {
            this.drawUltiHitbox(this.player.x, this.player.y, 200);
        }
        
        // Dibujar animación de hitbox de ultimate (cuando se activa)
        if (this.ultiHitboxAnimation) {
            this.drawUltiHitboxAnimation(this.ultiHitboxAnimation);
        }
        
        // Dibujar jugadores
        this.players.forEach(player => {
            player.render(this.ctx);
            
            // Dibujar proyectiles
            if (player.projectiles) {
                player.projectiles.forEach(proj => proj.render(this.ctx));
            }
        });
        
        // Dibujar mini-mapa o información adicional
        this.drawMinimap();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(74, 158, 255, 0.1)';
        this.ctx.lineWidth = 1;
        const gridSize = 50;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawMinimap() {
        // Mini-mapa en la esquina
        const minimapSize = 150;
        const minimapX = this.canvas.width - minimapSize - 20;
        const minimapY = 20;
        const scale = minimapSize / Math.max(this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'rgba(10, 10, 26, 0.9)';
        this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        this.ctx.strokeStyle = '#4a9eff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // Dibujar paredes en mini-mapa
        this.ctx.fillStyle = '#4a4a6e';
        this.walls.forEach(wall => {
            this.ctx.fillRect(
                minimapX + wall.x * scale,
                minimapY + wall.y * scale,
                wall.width * scale,
                wall.height * scale
            );
        });
        
        // Dibujar jugadores en mini-mapa
        this.players.forEach(player => {
            this.ctx.fillStyle = player.team === 'A' ? '#4aff7f' : '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.arc(
                minimapX + player.x * scale,
                minimapY + player.y * scale,
                3,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }

    drawUltiHitbox(x, y, radius) {
        // Dibujar círculo de área de efecto cuando la ultimate está lista
        this.ctx.save();
        
        // Círculo exterior con borde pulsante
        const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
        this.ctx.strokeStyle = `rgba(255, 200, 0, ${0.3 * pulse})`;
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Círculo interior más opaco
        this.ctx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.95, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Relleno semi-transparente
        this.ctx.fillStyle = 'rgba(255, 200, 0, 0.1)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Texto indicador
        this.ctx.fillStyle = '#ffc800';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('ULTIMATE LISTA', x, y);
        
        this.ctx.restore();
    }

    drawUltiHitboxAnimation(animation) {
        // Dibujar animación de expansión cuando se activa la ultimate
        this.ctx.save();
        
        const progress = animation.time / animation.duration;
        const alpha = 1 - progress; // Se desvanece mientras se expande
        
        // Círculo exterior con efecto de onda
        this.ctx.strokeStyle = `rgba(255, 100, 0, ${alpha * 0.8})`;
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.arc(animation.x, animation.y, animation.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Círculo interior más brillante
        this.ctx.strokeStyle = `rgba(255, 200, 0, ${alpha})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(animation.x, animation.y, animation.radius * 0.8, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Relleno pulsante
        this.ctx.fillStyle = `rgba(255, 150, 0, ${alpha * 0.2})`;
        this.ctx.beginPath();
        this.ctx.arc(animation.x, animation.y, animation.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Efecto de partículas/rayos
        const rayCount = 8;
        for (let i = 0; i < rayCount; i++) {
            const angle = (Math.PI * 2 / rayCount) * i;
            const startX = animation.x + Math.cos(angle) * (animation.radius * 0.7);
            const startY = animation.y + Math.sin(angle) * (animation.radius * 0.7);
            const endX = animation.x + Math.cos(angle) * animation.radius;
            const endY = animation.y + Math.sin(angle) * animation.radius;
            
            this.ctx.strokeStyle = `rgba(255, 200, 0, ${alpha * 0.6})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
}

// Clase Jugador
class Player {
    constructor(x, y, role, team) {
        this.x = x;
        this.y = y;
        this.role = role;
        this.team = team;
        this.angle = 0;
        this.speed = 100;
        this.radius = 15;
        this.health = 100;
        this.maxHealth = 100;
        this.isDead = false;
        this.keys = {};
        this.projectiles = [];
        this.lastAttack = 0;
        this.attackCooldown = 0;
        this.shieldCooldown = 0;
        this.ultiCharge = 0;
        this.healCooldown = 0;
        this.buffs = {};
        this.isAI = false;
        this.aiTarget = null;
        
        // Configuración según rol
        this.setupRole();
    }

    setupRole() {
        if (this.role === 'tank') {
            this.maxHealth = 200;
            this.health = 200;
            this.speed = 80;
            this.attackDamage = 25;
            this.attackRange = 30;
            this.attackCooldown = 1.5;
        } else if (this.role === 'dps') {
            this.maxHealth = 100;
            this.health = 100;
            this.speed = 120;
            this.attackDamage = 15;
            this.attackRange = 300;
            this.attackCooldown = 0.5;
            this.currentWeapon = 'rifle';
            this.accessories = new Set();
        } else if (this.role === 'support') {
            this.maxHealth = 80;
            this.health = 80;
            this.speed = 100;
            this.attackDamage = 10;
            this.attackRange = 200;
            this.attackCooldown = 1;
        }
    }

    changeWeapon(weaponType) {
        this.currentWeapon = weaponType;
        const weapons = {
            rifle: { damage: 15, fireRate: 0.5, range: 300, speed: 400 },
            sniper: { damage: 50, fireRate: 2, range: 600, speed: 600 },
            shotgun: { damage: 30, fireRate: 1.5, range: 150, speed: 300 },
            smg: { damage: 10, fireRate: 0.3, range: 250, speed: 350 }
        };
        
        const weapon = weapons[weaponType];
        this.attackDamage = weapon.damage;
        this.attackCooldown = weapon.fireRate;
        this.attackRange = weapon.range;
        this.projectileSpeed = weapon.speed;
    }

    toggleAccessory(effect) {
        if (this.accessories.has(effect)) {
            this.accessories.delete(effect);
        } else {
            this.accessories.add(effect);
        }
        
        // Aplicar efectos
        if (effect === 'damage') {
            this.attackDamage *= this.accessories.has(effect) ? 1.2 : 1/1.2;
        } else if (effect === 'fireRate') {
            this.attackCooldown *= this.accessories.has(effect) ? 0.8 : 1/0.8;
        }
    }

    applyBuff(type, multiplier, duration) {
        if (!this.buffs[type]) {
            this.buffs[type] = [];
        }
        this.buffs[type].push({ multiplier, duration });
    }

    updateBuffs(deltaTime) {
        Object.keys(this.buffs).forEach(type => {
            this.buffs[type] = this.buffs[type].filter(buff => {
                buff.duration -= deltaTime;
                return buff.duration > 0;
            });
        });
    }

    getBuffMultiplier(type) {
        if (!this.buffs[type] || this.buffs[type].length === 0) return 1;
        return this.buffs[type].reduce((acc, buff) => acc * buff.multiplier, 1);
    }

    update(deltaTime, walls, canvas) {
        if (this.isDead) return;
        
        // Movimiento
        let dx = 0;
        let dy = 0;
        
        if (this.keys['w']) dy -= 1;
        if (this.keys['s']) dy += 1;
        if (this.keys['a']) dx -= 1;
        if (this.keys['d']) dx += 1;
        
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
            dx /= length;
            dy /= length;
        }
        
        const newX = this.x + dx * this.speed * deltaTime;
        const newY = this.y + dy * this.speed * deltaTime;
        
        // Verificar colisiones con paredes
        let canMoveX = true;
        let canMoveY = true;
        
        walls.forEach(wall => {
            if (newX + this.radius > wall.x && newX - this.radius < wall.x + wall.width &&
                this.y + this.radius > wall.y && this.y - this.radius < wall.y + wall.height) {
                canMoveX = false;
            }
            if (this.x + this.radius > wall.x && this.x - this.radius < wall.x + wall.width &&
                newY + this.radius > wall.y && newY - this.radius < wall.y + wall.height) {
                canMoveY = false;
            }
        });
        
        // Verificar límites del canvas
        if (newX - this.radius < 0 || newX + this.radius > canvas.width) canMoveX = false;
        if (newY - this.radius < 0 || newY + this.radius > canvas.height) canMoveY = false;
        
        if (canMoveX) this.x = newX;
        if (canMoveY) this.y = newY;
        
        // Actualizar ángulo hacia el mouse
        // (para IA se calculará en updateAI)
        
        // Actualizar cooldowns
        if (this.lastAttack > 0) this.lastAttack -= deltaTime;
    }

    updateAI(deltaTime, players, walls, canvas) {
        if (this.isDead) return;
        
        // Buscar objetivo más cercano
        let nearestEnemy = null;
        let nearestDist = Infinity;
        
        players.forEach(p => {
            if (p.team !== this.team && !p.isDead) {
                const dist = Math.sqrt(
                    Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2)
                );
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = p;
                }
            }
        });
        
        if (nearestEnemy) {
            this.aiTarget = nearestEnemy;
            const dx = nearestEnemy.x - this.x;
            const dy = nearestEnemy.y - this.y;
            this.angle = Math.atan2(dy, dx);
            
            // Moverse hacia el enemigo o alejarse según el rol
            if (this.role === 'tank') {
                // Tanque se acerca
                this.keys['w'] = dy < 0;
                this.keys['s'] = dy > 0;
                this.keys['a'] = dx < 0;
                this.keys['d'] = dx > 0;
            } else if (this.role === 'dps') {
                // DPS mantiene distancia
                if (nearestDist < this.attackRange * 0.7) {
                    this.keys['w'] = dy > 0;
                    this.keys['s'] = dy < 0;
                    this.keys['a'] = dx > 0;
                    this.keys['d'] = dx < 0;
                } else {
                    this.keys['w'] = dy < 0;
                    this.keys['s'] = dy > 0;
                    this.keys['a'] = dx < 0;
                    this.keys['d'] = dx > 0;
                }
            }
            
            // Atacar si está en rango
            if (nearestDist <= this.attackRange && this.lastAttack <= 0) {
                if (this.role === 'tank') {
                    // Tanque ataca cuerpo a cuerpo
                    this.checkMeleeAttack(players);
                } else {
                    // DPS y Support atacan a distancia
                    this.attack(nearestEnemy.x, nearestEnemy.y);
                }
            }
        }
        
        this.update(deltaTime, walls, canvas);
    }

    attack(targetX, targetY) {
        if (this.lastAttack > 0 || this.isDead) return;
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.attackRange) return;
        
        this.angle = Math.atan2(dy, dx);
        
        if (this.role === 'tank') {
            // Ataque cuerpo a cuerpo - buscar enemigo en rango y hacer daño directo
            // Esto se hace desde el Game.update() llamando checkMeleeAttack()
            this.lastAttack = this.attackCooldown;
        } else {
            // Ataque a distancia - proyectil
            const damage = this.attackDamage * this.getBuffMultiplier('damage');
            const proj = new Projectile(
                this.x,
                this.y,
                this.angle,
                this.projectileSpeed || 400,
                damage,
                this.team
            );
            this.projectiles.push(proj);
            this.lastAttack = this.attackCooldown;
        }
    }

    checkMeleeAttack(players) {
        // Verificar ataque cuerpo a cuerpo para tanques
        if (this.role === 'tank' && this.lastAttack <= 0) {
            const attackAngle = Math.PI / 3; // 60 grados de arco de ataque
            const attackRange = this.attackRange;
            
            players.forEach(target => {
                if (target.team !== this.team && !target.isDead) {
                    const dx = target.x - this.x;
                    const dy = target.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= attackRange) {
                        const targetAngle = Math.atan2(dy, dx);
                        const angleDiff = Math.abs(targetAngle - this.angle);
                        const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
                        
                        if (normalizedAngleDiff <= attackAngle / 2) {
                            const damage = this.attackDamage * this.getBuffMultiplier('damage');
                            target.takeDamage(damage);
                            this.lastAttack = this.attackCooldown;
                        }
                    }
                }
            });
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
        }
    }

    render(ctx) {
        if (this.isDead) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Color según equipo
        ctx.fillStyle = this.team === 'A' ? '#4aff7f' : '#ff6b6b';
        ctx.strokeStyle = this.team === 'A' ? '#2aff5f' : '#ff4b4b';
        
        // Dibujar jugador según rol
        if (this.role === 'tank') {
            ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            // Dibujar símbolo de escudo
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🛡️', 0, 0);
        } else if (this.role === 'dps') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚔️', 0, 0);
        } else if (this.role === 'support') {
            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            ctx.lineTo(-this.radius, this.radius);
            ctx.lineTo(this.radius, this.radius);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨', 0, 0);
        }
        
        ctx.restore();
        
        // Dibujar barra de vida
        if (this.health < this.maxHealth) {
            const barWidth = this.radius * 2;
            const barHeight = 4;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 10, barWidth, barHeight);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(
                this.x - barWidth / 2,
                this.y - this.radius - 10,
                barWidth * (this.health / this.maxHealth),
                barHeight
            );
        }
    }
}

// Clase Proyectil
class Projectile {
    constructor(x, y, angle, speed, damage, team) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.damage = damage;
        this.team = team;
        this.radius = 4;
    }

    update(deltaTime) {
        this.x += Math.cos(this.angle) * this.speed * deltaTime;
        this.y += Math.sin(this.angle) * this.speed * deltaTime;
    }

    render(ctx) {
        ctx.fillStyle = this.team === 'A' ? '#4aff7f' : '#ff6b6b';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Clase Escudo
class Shield {
    constructor(x, y, angle, health, team) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.maxHealth = health;
        this.health = health;
        this.team = team;
        this.width = 60;
        this.height = 10;
        this.lifetime = 30; // 30 segundos
    }

    update(deltaTime) {
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.health = 0;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    render(ctx) {
        if (this.health <= 0) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Dibujar escudo con barra de vida
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = this.team === 'A' ? 
            `rgba(74, 255, 127, ${0.3 + healthPercent * 0.5})` : 
            `rgba(255, 107, 107, ${0.3 + healthPercent * 0.5})`;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.strokeStyle = this.team === 'A' ? '#4aff7f' : '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.restore();
    }
}

// Inicializar juego cuando la página carga
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    
    // Añadir evento para actualizar ángulo del jugador según mouse
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('mousemove', (e) => {
        if (game.player && game.gameRunning) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const dx = x - game.player.x;
            const dy = y - game.player.y;
            game.player.angle = Math.atan2(dy, dx);
        }
    });
});
