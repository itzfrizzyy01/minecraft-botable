/* 
================================================================================
MINECRAFT BOT - RENDER FREE TIER "STAY AWAKE FOREVER" EDITION (Minimal Logs)
================================================================================

This version:
- Only logs when the bot successfully joins the MC server (saves memory)
- All other console output removed
- Keeps your bot connected to the Minecraft server forever with 5s auto-rejoin
- /register on first join of the process, /login on every reconnect

HOW TO STOP RENDER FROM SLEEPING AUTOMATICALLY:
────────────────────────────────────────────────
Free Render dynos sleep after ~15 minutes with NO incoming HTTP requests.
This code CANNOT prevent sleeping by itself (no code can).

YOU MUST DO THIS ONCE:
1. Deploy this code to Render as a Web Service
2. After first deploy, copy your full URL (https://your-app-name.onrender.com)
3. Go to https://uptimerobot.com (completely free)
4. Create a new monitor:
   - Monitor Type: HTTP(s)
   - URL: paste your Render URL
   - Monitoring Interval: 5 minutes
5. Save it

UptimeRobot will ping your bot every 5 minutes → Render stays awake 24/7 forever.
Your bot will then stay in the Minecraft server forever and auto-rejoin instantly.

That's the ONLY way on free Render.
================================================================================
*/

const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const mcDataLoader = require("minecraft-data");
const http = require("http");

// === CONFIG (Recommended: set these in Render → Environment Variables) ===
const HOST = process.env.MC_HOST || "noblesmp1.mcsh.io";
const PORT = parseInt(process.env.MC_PORT || "25565", 10);
const USERNAME = process.env.MC_USERNAME || "mr_trollingYT";
const VERSION = process.env.MC_VERSION || "1.21.4";
const PASSWORD = process.env.MC_PASSWORD || "221103445";

// State
let firstJoin = true;
let botInstance = null;
let isConnectedToMC = false;
let lastSpawnTime = null;

function createBot() {
  if (botInstance) {
    try {
      botInstance.removeAllListeners();
      botInstance.quit();
    } catch (e) {}
    botInstance = null;
  }

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: VERSION
  });

  botInstance = bot;
  bot.loadPlugin(pathfinder);

  // Only log on successful join (as requested)
  bot.on("spawn", () => {
    console.log(`Bot joined MC server at ${new Date().toISOString()}`);
    isConnectedToMC = true;
    lastSpawnTime = new Date();

    const delay = 2500;

    if (firstJoin) {
      setTimeout(() => {
        bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
      }, delay);
      firstJoin = false;
    } else {
      setTimeout(() => {
        bot.chat(`/login ${PASSWORD}`);
      }, delay);
    }

    setTimeout(() => {
      if (bot.entity) startAdvancedAntiAFK(bot);
    }, delay + 2000);
  });

  // Auto rejoin every 5 seconds - no console.log here (minimal logs)
  bot.on("end", () => {
    isConnectedToMC = false;
    botInstance = null;
    setTimeout(createBot, 5000);
  });

  bot.on("kicked", () => {
    // no log
  });

  bot.on("error", () => {
    // no log
  });

  bot.on("death", () => {
    // no log
  });

  // No chat listener (saves memory)
}

function startAdvancedAntiAFK(bot) {
  const mcData = mcDataLoader(bot.version);
  const movements = new Movements(bot, mcData);
  movements.canDig = false;
  movements.allow1by1Passage = true;
  bot.pathfinder.setMovements(movements);

  const home = bot.entity.position.clone();
  let patrolCounter = 0;

  async function patrol() {
    if (!bot.entity || !bot.pathfinder) {
      return setTimeout(patrol, 5000);
    }

    try {
      patrolCounter++;

      if (patrolCounter % 5 === 0) {
        await bot.pathfinder.goto(new goals.GoalNear(home.x, home.y, home.z, 2));
      } else {
        const radius = 8;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius;
        const tx = home.x + Math.cos(angle) * dist;
        const tz = home.z + Math.sin(angle) * dist;
        await bot.pathfinder.goto(new goals.GoalNear(tx, home.y, tz, 1.5));
      }

      if (Math.random() < 0.6) {
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * 0.8;
        bot.look(yaw, pitch, true);
      }
      if (Math.random() < 0.35) {
        bot.setControlState("jump", true);
        setTimeout(() => bot.setControlState("jump", false), 180);
      }

      const wait = 6000 + Math.random() * 10000;
      setTimeout(patrol, wait);

    } catch (e) {
      setTimeout(patrol, 3000);
    }
  }

  patrol();

  // Lightweight backup movement (no logs)
  setInterval(() => {
    if (!bot.entity) return;
    if (Math.random() < 0.12) {
      const yaw = Math.random() * Math.PI * 2;
      bot.look(yaw, 0, true);
    }
    if (Math.random() < 0.04) {
      bot.setControlState("forward", true);
      setTimeout(() => bot.setControlState("forward", false), 700);
    }
  }, 4500);
}

// === HTTP SERVER FOR RENDER + UPTIME ROBOT ===
const httpServer = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    const uptime = Math.floor(process.uptime());
    const status = isConnectedToMC 
      ? "CONNECTED to Minecraft" 
      : "DISCONNECTED - reconnecting soon";
    const last = lastSpawnTime ? lastSpawnTime.toISOString() : "Never";

    res.end(`Minecraft Bot - Render Forever Edition (Minimal Logs)
Status: ${status}
Last join: ${last}
Uptime: ${uptime}s
First join this session: ${firstJoin ? "YES (will register)" : "NO (will login)"}

To keep Render awake 24/7 on FREE tier:
→ Use UptimeRobot.com to ping this URL every 5 minutes
→ Your bot will NEVER sleep and will stay in MC server forever
`);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

const httpPort = process.env.PORT || 3000;
httpServer.listen(httpPort, () => {
  // Only one startup log (not "join" but necessary)
  console.log(`HTTP server ready on port ${httpPort} - ready for UptimeRobot pings`);
});

createBot();

process.on("SIGINT", () => {
  if (botInstance) botInstance.quit();
  httpServer.close(() => process.exit(0));
});
