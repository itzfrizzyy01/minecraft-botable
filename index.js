const mineflayer = require("mineflayer")
const http = require("http")

// === SETTINGS ===
const BOT_HOST = "1deadsteal.aternos.me"
const BOT_PORT = 60929     // update if Aternos gives a new one
const BOT_NAME = "mr_trolling"

// === BOT CREATION ===
function startBot() {
  const bot = mineflayer.createBot({
    host: BOT_HOST,
    port: BOT_PORT,
    username: BOT_NAME,
    version: "1.20"   // force Minecraft 1.20
  })

  bot.once("spawn", async () => {
    try {
      bot.setControlState("forward", true)
      await new Promise(r => setTimeout(r, 2000))
      bot.setControlState("forward", false)

      bot.setControlState("back", true)
      await new Promise(r => setTimeout(r, 2000))
      bot.setControlState("back", false)
    } catch {}
  })

  bot.on("end", () => setTimeout(startBot, 5000))
  bot.on("kicked", () => setTimeout(startBot, 5000))
  bot.on("error", () => {})
}

startBot()

// === KEEP-ALIVE SERVER ===
const PORT = process.env.PORT || 3000
http.createServer((req, res) => res.end("alive")).listen(PORT)

