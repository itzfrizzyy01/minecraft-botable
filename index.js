// index.js
const mineflayer = require('mineflayer');
const http = require('http');

// Ping self interval (to stay awake on Render)
const PING_INTERVAL = 5 * 60 * 1000; // every 5 minutes

function createBot() {
  const bot = mineflayer.createBot({
    host: '1deadsteal.aternos.me',
    port: 42500,
    username: 'mr_trolling',
    version: "1.20.4" // match your server version
});

  // Disable all console spam
  bot.on('message', () => {});
  bot.on('chat', () => {});

  // Infinite rejoin
  bot.on('kicked', () => setTimeout(createBot, 5000));
  bot.on('end', () => setTimeout(createBot, 5000));

  // Movement loop
  bot.on('spawn', () => {
    function moveLoop() {
      if (!bot.entity) return;
      bot.setControlState('forward', true);
      setTimeout(() => {
        bot.setControlState('forward', false);
        bot.setControlState('back', true);
        setTimeout(() => {
          bot.setControlState('back', false);
          moveLoop();
        }, 2000); // move back 2s
      }, 2000); // move forward 2s
    }
    moveLoop();
  });
}

// Start bot
createBot();

// Fake HTTP server to keep Render happy
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running\n');
}).listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port', process.env.PORT || 3000);
});

// Self-ping to stay awake
setInterval(() => {
  http.get(`http://localhost:${process.env.PORT || 3000}`, res => {
    // optional: you can log or ignore
    res.on('data', () => {});
  }).on('error', () => {});
}, PING_INTERVAL);


