import {
  makeRandomMove,
  calculateDistance,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
} from "../lib/helpers";

import debug from "debug";
const log = debug("clashjs:bot:terminatorbot");
localStorage.debug='clashjs:bot:terminatorbot'

const findClosestEnemy = function (player, enemies) {
  log("### player, enemies", player, enemies);
  const sortedEnemies = enemies
    .map((enemy) => ({
      position: enemy.position,
      distance: calculateDistance(player.position, enemy.position),
    }))
    .sort((enemy1, enemy2) => enemy1.distance - enemy2.distance);

  return sortedEnemies.length > 0 ? sortedEnemies[0].position : null;
};

export default {
  info: {
    name: "terminatorbot",
    style: 26,
    team: 3,
  },
  ai: function (player, enemies, game) {
    console.log("Executing my AI function", player, enemies, game);

    // Check if we are in immediate danger, if so try to move
    if (threatsFacingMe(player, enemies).length > 0) {
      log("In danger! Lets try to move");
      if (canMoveForward(player, game)) {
        return "move";
      }
    }

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies);
    if (player.ammo > 0 && targets.length > 0) {
      log("Found someone to shoot", targets);
      return "shoot";
    }

    // Find closest enemy
    const closestEnemy = findClosestEnemy(player, enemies);
    console.log('######TCL: closestEnemy', closestEnemy)

    if (player.ammo > 0 && closestEnemy) {
      log("Found an enemy", closestEnemy);
      const enemyDir = calculateHeading(player.position, closestEnemy);

      log("Heading towards enemy", enemyDir);
      if (enemyDir === player.direction) {
        return "move";
      } else {
        return enemyDir;
      }
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game);
    console.log('######TCL: closestAmmo', closestAmmo)

    // TODO: Update this to find the closest ammo not in danger of enemies
    if (player.ammo < 3 && closestAmmo) {
      log("Found some ammo", closestAmmo);
      const ammoDir = calculateHeading(player.position, closestAmmo);

      log("Heading towards ammo", ammoDir);
      if (ammoDir === player.direction) {
        return "move";
      } else {
        return ammoDir;
      }
    }
        
    // Nothing else to do ... lets just make a random move
    log("Bummer, found nothing interesting to do ... making random move");
    return makeRandomMove();
  },
};
