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

## Instalación y Uso

1. Abre `index.html` en un navegador web moderno
2. Crea una partida o únete a una existente
3. Selecciona tu rol
4. ¡Comienza a jugar!

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

