import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
  let who;

  // Verificamos si se menciona a alguien o se cita un mensaje
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    who = m.quoted.sender;
  } else {
    who = m.sender;
  }

  let name = conn.getName(who);
  let name2 = conn.getName(m.sender);

  if (typeof m.react === 'function') m.react('🍑');

  let str;

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    str = `\`${name2}\` está agarrando las nalgas de \`${name || who}\`. 🥵 🍑`;
  } else if (m.quoted) {
    str = `\`${name2}\` está agarrando las nalgas de \`${name || who}\`. ¡Cuidado! 🍑`;
  } else {
    str = `\`${name2}\` está agarrando nalgas por ahí.`;
  }

  if (m.isGroup) {
    let pp1 = 'https://files.catbox.moe/yjulgu.mp4';
    let pp2 = 'https://files.catbox.moe/erm82k.mp4';
    let pp3 = 'https://files.catbox.moe/9m1nkp.mp4';
    let pp4 = 'https://files.catbox.moe/rzijb5.mp4';

    const gifs = [pp1, pp2, pp3, pp4];
    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    let mentions = who ? [who] : [];

    await conn.sendMessage(
      m.chat,
      {
        video: { url: gif },
        gifPlayback: true,
        caption: str,
        mentions
      },
      { quoted: m }
    );
  }
};

handler.help = ['agarrarnalgas @tag'];
handler.tags = ['emox'];
handler.command = ['agarrarnalgas'];
handler.group = true;

export default handler;