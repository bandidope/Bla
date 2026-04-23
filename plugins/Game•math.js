//código creado x The Carlos 👑 

global.math = global.math || {};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const help = `
🌵 *Selecciona la dificultad*

🚩 Modos disponibles:
• ${Object.keys(modes).join(' | ')}

📌 Ejemplo:
*${usedPrefix + command} easy*
`.trim();

  if (!args[0]) return conn.reply(m.chat, help, m);

  const mode = args[0].toLowerCase();
  if (!(mode in modes)) return conn.reply(m.chat, help, m);

  const id = m.chat;
  if (global.math[id]) {
    return conn.reply(m.chat, '🌵 Ya hay un reto activo en este chat.', m);
  }

  const math = genMath(mode);

  global.db.data.users[m.sender] ||= { monedas: 0 };
  const user = global.db.data.users[m.sender];
  if (typeof user.monedas !== 'number') user.monedas = 0;

  global.math[id] = {
    msg: await conn.reply(
      m.chat,
      `🧮 *Resuelve esto:*\n\n${math.str}\n\n⏱️ Tiempo: ${(math.time / 1000).toFixed(1)}s\n💰 Recompensa: ${math.bonus.toLocaleString()} monedas`,
      m
    ),
    ...math,
    tries: 3,
    timeout: setTimeout(() => {
      if (global.math[id]) {
        conn.reply(m.chat, `⏳ Tiempo terminado.\n\n✔️ Respuesta correcta: *${math.result}*`, m);
        delete global.math[id];
      }
    }, math.time)
  };
};

handler.before = async (m, { conn }) => {
  const id = m.chat;
  const game = global.math[id];
  if (!game) return;

  const user = global.db.data.users[m.sender] ||= { monedas: 0 };

  const answer = Number(m.text);

  if (!isNaN(answer) && answer === game.result) {
    user.monedas += game.bonus;

    conn.reply(
      m.chat,
      `🎉 ¡Correcto!\nGanaste *${game.bonus.toLocaleString()}* monedas 💰`,
      m
    );

    clearTimeout(game.timeout);
    delete global.math[id];
    return;
  }

  game.tries--;

  if (game.tries > 0) {
    conn.reply(m.chat, `❌ Incorrecto.\n🔁 Intentos restantes: *${game.tries}*`, m);
  } else {
    conn.reply(
      m.chat,
      `💀 Sin intentos.\n✔️ Respuesta correcta: *${game.result}*`,
      m
    );

    clearTimeout(game.timeout);
    delete global.math[id];
  }
};

handler.help = ['math <modo>'];
handler.tags = ['fun'];
handler.command = ['math', 'mates', 'matemáticas'];

export default handler;