const mineflayer = require('mineflayer');

function createBot() {
  const bot = mineflayer.createBot({
    host: '1deadsteal.aternos.me',
    port: 60929,
    username: 'mr_trolling',
  });

  // Quiet mode
  bot.on('message', () => {});
  bot.on('chat', () => {});

  // Auto reconnect
  bot.on('kicked', () => {
    console.log("Kicked, reconnecting...");
    setTimeout(createBot, 5000);
  });
  bot.on('end', () => {
    console.log("Disconnected, reconnecting...");
    setTimeout(createBot, 5000);
  });

  // Movement loop
  bot.on('spawn', () => {
    console.log("Bot spawned, starting movement loop...");

    let forward = true;

    setInterval(() => {
      // reset all keys first
      bot.clearControlStates();

      if (forward) {
        console.log("Moving forward...");
        bot.setControlState('forward', true);
      } else {
        console.log("Moving back...");
        bot.setControlState('back', true);
      }

      // jump so it doesn’t get stuck
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);

      forward = !forward;
    }, 3000); // switch direction every 3 seconds
  });
}

createBot();
