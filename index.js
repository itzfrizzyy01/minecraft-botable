// bot.js
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalBlock } = goals;

function createBot() {
  const bot = mineflayer.createBot({
    host: '1deadsteal.aternos.me',
    port: 60929,
    username: 'mr_trolling',
    version: '1.21.1' // change this to your server's exact version if different
  });

  bot.loadPlugin(pathfinder);

  bot.on('spawn', () => {
    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);

    // Save spawn point
    const spawn = bot.entity.position.clone().floor();

    async function walkLoop() {
      try {
        // Walk 2 blocks forward (X + 2, you can change axis if needed)
        const forward = spawn.offset(2, 0, 0);
        await bot.pathfinder.goto(new GoalBlock(forward.x, forward.y, forward.z));

        // Walk back to spawn
        await bot.pathfinder.goto(new GoalBlock(spawn.x, spawn.y, spawn.z));

        setTimeout(walkLoop, 500); // repeat
      } catch (err) {
        setTimeout(walkLoop, 2000); // retry if error
      }
    }

    bot.pathfinder.setMovements(defaultMove);
    walkLoop();
  });

  bot.on('kicked', () => setTimeout(createBot, 5000));
  bot.on('end', () => setTimeout(createBot, 5000));

  // Silence logs
  bot.on('message', () => {});
  bot.on('chat', () => {});
}

createBot();
