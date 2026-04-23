const handler = async (m, { conn, text, command, usedPrefix }) => {
  global.db.data.owners ||= []

  const emoji = '👑'
  const emoji2 = '⚠️'

  const who = m.mentionedJid?.[0]
    ? m.mentionedJid[0]
    : m.quoted?.sender
    ? m.quoted.sender
    : text
    ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    : false

  // LISTA DE OWNERS
  if (command === 'owners') {
    if (!global.db.data.owners.length) {
      return conn.reply(m.chat, `${emoji2} No hay owners registrados.`, m)
    }

    let txt = `👑 *LISTA DE OWNERS*\n\n`
    txt += global.db.data.owners.map(v => `• @${v.split('@')[0]}`).join('\n')

    return conn.sendMessage(m.chat, {
      text: txt,
      mentions: global.db.data.owners,
      footer: `Total: ${global.db.data.owners.length} owners`,
      buttons: [
        { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '📋 Menú' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (!who) {
    return conn.reply(
      m.chat,
      `${emoji2} Por favor menciona o responde a un usuario.`,
      m,
      { mentions: [m.sender] }
    )
  }

  switch (command) {

    case 'addowner':
      if (global.db.data.owners.includes(who)) {
        return conn.reply(m.chat, `${emoji2} Ese usuario ya es owner.`, m)
      }

      global.db.data.owners.push(who)

      return conn.sendMessage(m.chat, {
        text: `${emoji} Usuario agregado como *owner* correctamente.`,
        buttons: [
          { buttonId: `${usedPrefix}owners`, buttonText: { displayText: '👑 Ver owners' }, type: 1 },
          { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '📋 Menú' }, type: 1 }
        ],
        headerType: 1
      }, { quoted: m })

    case 'delowner':
      const index = global.db.data.owners.indexOf(who)

      if (index === -1) {
        return conn.reply(m.chat, `${emoji2} Ese usuario no es owner.`, m)
      }

      global.db.data.owners.splice(index, 1)

      return conn.sendMessage(m.chat, {
        text: `${emoji2} Owner eliminado correctamente.`,
        buttons: [
          { buttonId: `${usedPrefix}owners`, buttonText: { displayText: '👑 Ver owners' }, type: 1 },
          { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '📋 Menú' }, type: 1 }
        ],
        headerType: 1
      }, { quoted: m })
  }
}

handler.command = ['addowner', 'delowner', 'owners']
handler.rowner = true

export default handler