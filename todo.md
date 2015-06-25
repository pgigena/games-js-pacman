Features:

- Add chomp sound.
- Add life sound.
- Rescale game to original size.
- Implement scalable drawing.
- Make energyzers blink.
- Implement mute button.
- Implement pause button.
- Implement ghost manager.
- Add bounds and current tile coordinates to character entity.
- Add score graphic when eating a ghost.
- Add custom DrawSprite method to make scalability code less intrusive.
- Replace all texts by sprite-based fonts.

Bugs:

- When player starts with more than 1 live, the game over screen restarts the level.
- Post-cornering aligning is wrong (Specially when going X to Y).
- Scared ghosts sometimes revert directions.
- Ghosts sometimes retain previous direction animation when coming out of scared state.
- PacMan eating animation is too fast?
- PacMan eating animation sometimes is too slow