// index.js
const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const mcDataLoader = require("minecraft-data");

let firstJoin = true; // track only once
const PASSWORD = "2211133445"; // your AuthMe password

function createBot() {
  const bot = mineflayer.createBot({
    host: "1deadsteal.play.hosting",
    port: 50068,
    username: "mr_trolling",
    version: "1.21"
  });

  bot.loadPlugin(pathfinder);

  bot.on("spawn", () => {
    if (firstJoin) {
      setTimeout(() => bot.chat(`/register ${PASSWORD} ${PASSWORD}`), 2000);
      firstJoin = false;
    } else {
      setTimeout(() => bot.chat(`/login ${PASSWORD}`), 2000);
    }

    // start movement after login delay too
    setTimeout(() => startWalkingLoop(bot), 4000);
  });

  bot.on("end", () => setTimeout(createBot, 5000));
  bot.on("kicked", () => {});
  bot.on("error", () => {});
}

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
      setTimeout(loop, 2000);
    }
  }

  loop();
}

createBot();

// --- Tiny web server for Render ---
const http = require("http");
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running\n");
}).listen(process.env.PORT || 3000);




