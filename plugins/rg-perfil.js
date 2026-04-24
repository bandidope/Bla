//código creado x The Carlos 👑
//no olvides dejar créditos 

import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'

const imagen1 = 'https://raw.githubusercontent.com/JTxs00/uploads/main/1776310123337.jpeg'

var handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.fromMe
    ? conn.user.jid
    : m.sender

  let pp
  try {
    pp = await conn.profilePictureUrl(who, 'image')
  } catch {
    pp = imagen1
  }

  let user = global.db.data.users[m.sender]
  if (!user) {
    global.db.data.users[m.sender] = {
      premium: false,
      level: 0,
      cookies: 0,
      exp: 0,
      lastclaim: 0,
      registered: false,
      regTime: -1,
      age: 0,
      role: '⭑ Novato ⭑'
    }
    user = global.db.data.users[m.sender]
  }

  let { premium, level, exp, registered, role } = user
  let username = await conn.getName(who)

  let animacion = `
〘 *Sistema Mágico * 〙📖

🔒 Detectando energía mágica...
⏳ Analizando grimorio del portador...
💠 Sincronizando con el maná...

✨✨✨ 𝙰𝙲𝚃𝙸𝚅𝙰𝙲𝙸𝙾́𝙽 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰 ✨✨✨

*El grimorio se ha abierto...*
`.trim()

  await conn.sendMessage(m.chat, { text: animacion }, { quoted: m })

  let noprem = `
『 ＧＲＩＭＯＲＩＯ ＢＡＳＥ 』📕

⚔️ *Portador:* ${username}
🆔 *Identificador:* @${who.replace(/@.+/, '')}
📜 *Registrado:* ${registered ? '✅ Activado' : '❌ No'}

🧪 *Estado Mágico:*
⚡ *Nivel:* ${level}
✨ *Experiencia:* ${exp}
📈 *Rango:* ${role}
🔮 *Premium:* ❌ No activo

📔 *Grimorio:* Básico de 1 hoja 📘
🔒 *Elemento:* Desconocido

📌 Mejora tu grimorio para desbloquear más magia...

━━━━━━━━━━━━━━━━━━
`.trim()

  let prem = `
👹〘 𝐌𝐎𝐃𝐎 𝐃𝐄𝐌𝐎𝐍𝐈𝐎: *𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎* 〙👹

🌌 ＧＲＩＭＯＲＩＯ ５ＬＴ（Ａ』

🧛 *Portador Élite:* ${username}
🧿 *ID:* @${who.replace(/@.+/, '')}
✅ *Registrado:* ${registered ? 'Sí' : 'No'}
👑 *Rango:* 🟣 *Supremo Demoníaco*

🔮 *Energía Oscura:*
⚡ *Nivel:* ${level}
🌟 *Experiencia:* ${exp}
🪄 *Rango Mágico:* ${role}
💠 *Estado Premium:* ✅ ACTIVADO

📕 *Grimorio:* ☯️ Anti-Magia de 5 hojas
🔥 *Modo Especial:* ✦ *Despertar Oscuro de Asta*
🧩 *Elemento:* Anti-Magia & Espada Demoníaca

📜 *Hechizo Desbloqueado:* 
❖ 「𝙱𝚕𝚊𝚌𝚔 the Legends ⚡」
   ↳ Daño masivo a bots enemigos.

📔 *Nota:* Este usuario ha superado sus límites... ☄️

🌌⟣══════════════⟢🌌
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: premium ? prem : noprem,
    mentions: [who]
  }, { quoted: m })
}

handler.help = ['profile']
handler.register = true
handler.group = true
handler.tags = ['rg']
handler.command = ['profile', 'perfil']
export default handler