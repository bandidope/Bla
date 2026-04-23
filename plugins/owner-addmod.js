let handler = async (m, { conn, text }) => {
  global.db.data.users ||= {}

  let who

  if (m.isGroup) {
    who = m.mentionedJid?.[0] || m.quoted?.sender
  } else {
    who = m.chat
  }

  if (!who) {
    return m.reply('❗ *Menciona a un usuario o responde a su mensaje.*')
  }

  if (!text) {
    return m.reply(
      `📥 *Ingresa la cantidad de monedas 🪙 a añadir.*\n\n` +
      `Ejemplo:\n*.añadirmonedas @user 50000*\n*.añadirmonedas @user infinito*`
    )
  }

  let args = text.trim().split(/\s+/)
  let cantidadTexto = args[args.length - 1].toLowerCase()

  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {
      exp: 0,
      monedas: 0,
      joincount: 1,
      diamond: 0,
      level: 0,
      bank: 0,
      premium: false,
      premiumTime: 0,
      banned: false
    }
  }

  const user = global.db.data.users[who]

  // INFINITO
  if (cantidadTexto === 'infinito' || cantidadTexto === '∞') {
    user.monedas = 999999999

    return conn.sendMessage(m.chat, {
      text: `
╭━━〔 💸 TESORO ILIMITADO 〕━━⬣
┃🎖️ Usuario: @${who.split('@')[0]}
┃💰 Monedas asignadas: *999,999,999 🪙*
┃🛡️ Estado: *INFINITO ACTIVADO*
╰━━━━━━━━━━━━━━━━━━━━⬣
      `.trim(),
      mentions: [who]
    }, { quoted: m })
  }

  let cantidad = parseInt(cantidadTexto.replace(/\D/g, ''))

  if (isNaN(cantidad)) {
    return m.reply('⚠️ *Solo se permiten números o la palabra "infinito".*')
  }

  if (cantidad < 1) {
    return m.reply('❌ *La cantidad mínima es 1.*')
  }

  if (cantidad > 1e9) {
    return m.reply('🚨 *Máximo permitido: 1,000,000,000 🪙*')
  }

  user.monedas += cantidad

  return conn.sendMessage(m.chat, {
    text: `
╭━━〔 🪙 MONEDAS ENTREGADAS 〕━━⬣
┃👤 Usuario: @${who.split('@')[0]}
┃💰 Añadidas: *${cantidad.toLocaleString()} 🪙*
┃💼 Total: *${user.monedas.toLocaleString()} 🪙*
╰━━━━━━━━━━━━━━━━━━━━⬣
    `.trim(),
    mentions: [who]
  }, { quoted: m })
}

handler.help = ['añadirmonedas @usuario cantidad']
handler.tags = ['owner']
handler.command = ['añadirmonedas', 'addmonedas', 'addmoney']
handler.rowner = true

export default handler