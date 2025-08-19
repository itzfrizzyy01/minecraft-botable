// index.js
const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const mcDataLoader = require("minecraft-data");

function createBot() {
  const bot = mineflayer.createBot({
    host: "1deadsteal.aternos.me", // your server IP
    port: 42500,                   // your server port
    username: "mr_trolling",       // bot username
    version: "1.20.4"              // MC version
  });

  // Silence chat/messages
  bot.on("message", () => {});
  bot.on("chat", () => {});

  bot.loadPlugin(pathfinder);

  bot.on("spawn", () => {
    startWalkingLoop(bot);
  });

  bot.on("end", () => {
    setTimeout(createBot, 5000); // reconnect after 5s
  });

  bot.on("kicked", () => {}); // ignore kick logs
  bot.on("error", () => {});  // ignore error logs
}

// Walk 2 blocks forward, then back, repeat
function startWalkingLoop(bot) {
  const mcData = mcDataLoader(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);

  const pos = bot.entity.position.clone();

  async function loop() {
    try {
      let forward = pos.offset(2, 0, 0);
      await bot.pathfinder.goto(new goals.GoalBlock(forward.x, forward.y, forward.z));
      await bot.pathfinder.goto(new goals.GoalBlock(pos.x, pos.y, pos.z));
      setTimeout(loop, 1000);
    } catch {
      setTimeout(loop, 2000); // retry if fail
    }
  }

  loop();
}

createBot();
