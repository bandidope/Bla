import fs from 'fs';

const timeout = 60000;
const poin = 10000;

const handler = async (m, { conn, usedPrefix }) => {
  conn.tekateki = conn.tekateki ? conn.tekateki : {};
  const id = m.chat;

  if (id in conn.tekateki) {
    return conn.reply(
      m.chat,
      'Todavía hay acertijos sin responder en este chat',
      conn.tekateki[id][0]
    );
  }

  let tekateki;

  try {
    tekateki = JSON.parse(fs.readFileSync(`./src/game/acertijo.json`));
  } catch (e) {
    return conn.reply(m.chat, '✘ Error al cargar los acertijos.', m);
  }

  if (!Array.isArray(tekateki) || tekateki.length === 0) {
    return conn.reply(m.chat, '✘ No hay acertijos disponibles.', m);
  }

  const json = tekateki[Math.floor(Math.random() * tekateki.length)];

  if (!json?.question || !json?.response) {
    return conn.reply(m.chat, '✘ Acertijo inválido en la base de datos.', m);
  }

  const clue = json.response.replace(/[A-Za-z]/g, '_');

  const caption = `
ⷮ🚩 *ACERTIJOS*
✨️ *${json.question}*

⏱️ *Tiempo:* ${(timeout / 1000).toFixed(0)} Segundos
🎁 *Premio:* *+${poin}* monedas 🪙`.trim();

  conn.tekateki[id] = [
    await conn.reply(m.chat, caption, m),
    json,
    poin,
    setTimeout(async () => {
      if (conn.tekateki[id]) {
        await conn.reply(
          m.chat,
          `🚩 Se acabó el tiempo!\n*Respuesta:* ${json.response}`,
          conn.tekateki[id][0]
        );
        delete conn.tekateki[id];
      }
    }, timeout)
  ];
};

handler.help = ['acertijo'];
handler.tags = ['fun'];
handler.command = ['acertijo', 'acert', 'adivinanza', 'tekateki'];

export default handler;