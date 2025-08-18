const mineflayer = require('mineflayer');
const http = require('http');

function createBot() {
  const bot = mineflayer.createBot({
    host: '1deadsteal.aternos.me',
    port: 60929,
    username: 'mr_trolling',
  });

  bot.on('message', () => {});
  bot.on('chat', () => {});
  bot.on('kicked', () => setTimeout(createBot, 5000));
  bot.on('end', () => setTimeout(createBot, 5000));

  bot.on('spawn', () => {
    let forward = true;
    setInterval(() => {
      bot.clearControlStates();
      if (forward) bot.setControlState('forward', true);
      else bot.setControlState('back', true);

      forward = !forward;
    }, 3000);
  });
}

// Tiny HTTP server to keep Render happy
http.createServer((req, res) => {
  res.end('Bot is running');
}).listen(process.env.PORT || 3000);

createBot();
