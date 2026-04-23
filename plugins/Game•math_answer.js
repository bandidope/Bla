//, Código creado x The Carlos 👑 
global.math = global.math || {};

const handler = async (m, { conn }) => {
  const id = m.chat;

  if (!m.quoted) return;
  if (m.quoted.sender !== conn.user.jid) return;
  if (!m.quoted.text) return;

  if (!/^🧮 ¿Cuánto es el resultado de/i.test(m.quoted.text)) return;
  if (!global.math[id]) return conn.reply(m.chat, '🌵 Ya se ha respondido a este reto.', m);

  const game = global.math[id];

  if (m.quoted.id !== game.msg.id) return;

  const user = global.db.data.users[m.sender] ||= { monedas: 0 };

  const answer = Number(m.text);

  if (answer === game.result) {
    user.monedas += game.bonus;

    conn.reply(
      m.chat,
      `🌵 Respuesta correcta.\n💰 Ganaste *${game.bonus.toLocaleString()}* monedas`,
      m
    );

    clearTimeout(game.timeout);
    delete global.math[id];
    return;
  }

  game.tries--;

  if (game.tries > 0) {
    conn.reply(
      m.chat,
      `🌵 Respuesta incorrecta.\n✨ Intentos restantes: *${game.tries}*`,
      m
    );
  } else {
    conn.reply(
      m.chat,
      `🌵 Sin intentos.\n⭐️ La respuesta correcta era: *${game.result}*`,
      m
    );

    clearTimeout(game.timeout);
    delete global.math[id];
  }
};

handler.customPrefix = /^-?\d+(\.\d+)?$/;
handler.command = new RegExp();

export default handler;