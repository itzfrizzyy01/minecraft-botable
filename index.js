const mineflayer = require('mineflayer')
const http = require('http')

function createBot() {
  const bot = mineflayer.createBot({
    host: "1deadsteal.aternos.me", // Aternos IP
    port: 45632,                   // check port each time you start server!
    username: "mr_trolling"        // bot name (cracked server)
    // If your server is online-mode = true, use:
    // username: "your_email",
    // password: "your_password",
    // auth: "microsoft"
  })

  // === Movement ===
  bot.on('spawn', async () => {
    console.log("✅ Bot spawned in server")
    setInterval(async () => {
      try {
        bot.setControlState('forward', true)
        await bot.waitForTicks(20) // move ~1 sec
        bot.setControlState('forward', false)

        bot.setControlState('back', true)
        await bot.waitForTicks(20)
        bot.setControlState('back', false)
      } catch {}
    }, 5000)
  })

  // === Auto Respawn ===
  bot.on('death', () => {
    console.log("☠️ Bot died, respawning...")
    bot.respawn()
  })

  // === Auto Reconnect ===
  bot.on('end', () => {
    console.log("🔄 Disconnected, retrying in 5s...")
    setTimeout(createBot, 5000)
  })

  // === Minimal Debug Logs ===
  bot.on('login', () => console.log("🔐 Logged in, waiting to spawn..."))
  bot.on('kicked', (reason) => console.log("⛔ Kicked:", reason))
  bot.on('error', (err) => console.log("⚠️ Error:", err.message))
}

// === Keep-Alive HTTP Server (Render) ===
const PORT = process.env.PORT || 3000
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Bot is alive\n')
}).listen(PORT, () => {
  console.log(`🌐 Keep-alive server running on port ${PORT}`)
})

// === Self-Ping Every 5 Minutes ===
setInterval(() => {
  http.get(`http://localhost:${PORT}`)
}, 5 * 60 * 1000)

// === Start Bot ===
createBot()
