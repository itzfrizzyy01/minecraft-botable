// index.js
const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const mcDataLoader = require("minecraft-data");

function createBot() {
  const bot = mineflayer.createBot({
    host: "1deadsteal.aternos.me",
    port: 44112,
    username: "mr_trolling",
    version: "1.20.4"
  });

  bot.loadPlugin(pathfinder);

  let loggedIn = false;

  // Detect login/register messages
  bot.on("messagestr", (msg) => {
    msg = msg.toLowerCase();

    if (msg.includes("register")) {
      bot.chat("/register mr_trolling mr_trolling");
    } else if (msg.includes("login")) {
      bot.chat("/login mr_trolling");
    }

    // After login success (server usually sends something like "Successfully logged in")
    if (msg.includes("success") || msg.includes("logged in")) {
      if (!loggedIn) {
        loggedIn = true;
        console.log("✅ Logged in, starting movement loop...");
        startWalkingLoop(bot);
      }
    }
  });

  bot.on("end", () => {
    console.log("Bot disconnected, retrying...");
    setTimeout(createBot, 5000);
  });

  bot.on("kicked", (reason) => {
    console.log("Kicked:", reason);
  });

  bot.on("error", (err) => {
    console.log("Error:", err);
  });
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

