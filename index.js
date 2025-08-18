const mineflayer = require("mineflayer")
const http = require("http")

// === SETTINGS ===
const BOT_HOST = "1deadsteal.aternos.me"
const BOT_PORT = 45632   // ⚠️ update this if Aternos gives a new one
const BOT_NAME = "mr_trolling"

// === BOT CREATION ===
function startBot() {
  const bot = mineflayer.createBot({
    host: BOT_HOST,
    port: BOT_PORT,
    username: BOT_NAME,
  })

  bot.once("login", () => console.log("✅ Logged in, waiting for spawn..."))
  bot.once("spawn", async () => {
    console.log("🎮 Spawned in game")
    try {
      bot.setControlState("forward", true)
      await new Promise(r => setTimeout(r, 2000)) // walk 2s forward
      bot.setControlState("forward", false)

      bot.setControlState("back", true)
      await new Promise(r => setTimeout(r, 2000)) // walk back
      bot.setControlState("back", false)

      console.log("↔️ Movement done, idle at spawn")
    } catch (e) {
      console.log("⚠️ Movement error:", e.message)
    }
  })

  bot.on("end", () => {
    console.log("🔁 Disconnected. Reconnecting in 5s...")
    setTimeout(startBot, 5000)
  })

  bot.on("kicked", reason => console.log("⛔ Kicked:", reason))
  bot.on("error", err => console.log("⚠️ Error:", err.message))
}

startBot()

// === KEEP-ALIVE SERVER ===
const PORT = process.env.PORT || 3000
http.createServer((req, res) => res.end("Bot alive")).listen(PORT)
