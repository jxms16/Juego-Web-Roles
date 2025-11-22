# Guerra de Roles - Juego Estratégico 5v5

Un juego web multijugador 5v5 con roles específicos, estilo militar-fantasía y perspectiva 2D top-down.

## Características

### Sistema de Roles

- **1 Tanque** por equipo
- **2 DPS** por equipo  
- **2 Soporte** por equipo

### Mecánicas del Tanque

- **Ataque cuerpo a cuerpo**: Solo puede atacar enemigos cercanos (30px de rango)
- **Escudo**: Puede desplegar un escudo/pared con 300 HP que bloquea proyectiles
  - Cooldown: 5 segundos
  - Se despliega en la dirección donde mira el tanque
- **Ulti - Romper Paredes**: Al cargar al 100%, puede destruir todas las paredes en un radio de 200px
  - Carga: 2% por segundo

### Mecánicas del DPS

- **Sistema de Armas**: Puede cambiar entre 4 tipos de armas:
  - **Rifle de Asalto**: Daño 15, Velocidad de disparo 0.5s, Rango 300px
  - **Francotirador**: Daño 50, Velocidad de disparo 2s, Rango 600px
  - **Escopeta**: Daño 30, Velocidad de disparo 1.5s, Rango 150px
  - **Subfusil**: Daño 10, Velocidad de disparo 0.3s, Rango 250px

- **Sistema de Accesorios**: 6 accesorios disponibles que modifican estadísticas:
  - **Mirilla**: Mejora precisión
  - **Cañón**: +20% daño
  - **Cargador**: -20% tiempo de recarga
  - **Silenciador**: Aumenta sigilo
  - **Empuñadura**: Mejora estabilidad
  - **Laser**: Mejora precisión

### Mecánicas del Soporte

- **Cura Equipo**: Cura 30 HP a todos los aliados
  - Cooldown: 10 segundos
  - **Cura Automática**: Cada 10 segundos cura automáticamente al equipo
  
- **Mejoras Temporales**:
  - **Mejora Tanque**: Aplica +50% daño por 15 segundos a todos los tanques aliados
  - **Mejora DPS**: Aplica +50% daño por 15 segundos a todos los DPS aliados

## Controles

- **WASD**: Movimiento
- **Mouse**: Controlar dirección del personaje
- **Click Izquierdo**: Atacar / Usar habilidad
- **Botones de Habilidad**: Dependiendo del rol, usar habilidades especiales

## Instalación y Uso Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor:
   ```bash
   npm start
   ```

3. Abre `http://localhost:3000` en tu navegador
4. Crea una partida o únete a una existente
5. Selecciona tu rol
6. ¡Comienza a jugar!

## Despliegue en Railway

Este proyecto está configurado para desplegarse fácilmente en Railway:

1. **Conecta tu repositorio a Railway:**
   - Ve a [Railway](https://railway.app)
   - Crea una nueva cuenta o inicia sesión
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu repositorio

2. **Railway detectará automáticamente:**
   - El archivo `package.json` (indica que es un proyecto Node.js)
   - El comando de inicio: `npm start`
   - El puerto: Railway asignará automáticamente el puerto a través de la variable de entorno `PORT`

3. **Despliegue automático:**
   - Railway construirá e instalará las dependencias automáticamente
   - El servidor se iniciará usando `npm start`
   - Tu aplicación estará disponible en una URL proporcionada por Railway

### Archivos necesarios para Railway:
- ✅ `package.json` - Define las dependencias y scripts
- ✅ `server.js` - Servidor Express para servir los archivos estáticos
- ✅ `railway.json` - Configuración opcional para Railway
- ✅ `.gitignore` - Excluye node_modules del repositorio

### Notas importantes:
- Railway usa la variable de entorno `PORT` automáticamente
- El servidor está configurado para usar `process.env.PORT || 3000`
- No necesitas configurar nada adicional, Railway lo detecta todo automáticamente

## Características Técnicas

- **Mapa 2D top-down**: Perspectiva desde arriba
- **Sistema de colisiones**: Paredes y obstáculos
- **IA básica**: Jugadores controlados por IA para simulación
- **Sistema de equipos**: Equipo A vs Equipo B
- **Mini-mapa**: Vista del mapa completo en la esquina

## Notas

- Este es un juego de demostración con jugadores IA simulados
- Para un juego multijugador real, se necesitaría un servidor backend
- Los jugadores se generan automáticamente al iniciar una partida

