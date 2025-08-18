const mineflayer = require('mineflayer')

function createBot() {
  const bot = mineflayer.createBot({
    host: '1deadsteal.aternos.me', // your server IP
    port: 60929,                   // your server port
    username: 'mr_trolling',       // bot username
    version: 1.20.4                 // auto-detect version
  })

  // Infinite rejoin if kicked or disconnected
  bot.on('end', () => {
    console.log('Bot disconnected, reconnecting...')
    setTimeout(createBot, 5000)
  })

  bot.on('kicked', (reason) => {
    console.log('Kicked:', reason)
  })

  bot.on('error', (err) => {
    console.log('Error:', err)
  })

  // Walk 2 blocks forward and back forever
  bot.once('spawn', () => {
    console.log('Bot spawned, starting movement loop...')
    let forward = true
    setInterval(() => {
      if (forward) {
        bot.setControlState('forward', true)
        setTimeout(() => bot.setControlState('forward', false), 1000)
      } else {
        bot.setControlState('back', true)
        setTimeout(() => bot.setControlState('back', false), 1000)
      }
      forward = !forward
    }, 3000)
  })
}

createBot()
