const mineflayer = require('mineflayer');

function createBot() {
  const bot = mineflayer.createBot({
    host: '1deadsteal.aternos.me',
    port: 45632,
    username: 'mr_trolling',
  });

  // Quiet mode
  bot.on('message', () => {});
  bot.on('chat', () => {});

  // Auto reconnect
  bot.on('kicked', () => {
    setTimeout(createBot, 5000);
  });
  bot.on('end', () => {
    setTimeout(createBot, 5000);
  });

  // Movement loop
  bot.on('spawn', () => {
    let forward = true;

    setInterval(() => {
      bot.clearControlStates();

      if (forward) {
        bot.setControlState('forward', true);
      } else {
        bot.setControlState('back', true);
      }

      // Jump to avoid getting stuck
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);

      forward = !forward;
    }, 3000);
  });
}

createBot();
