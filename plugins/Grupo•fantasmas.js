import { areJidsSameUser } from '@whiskeysockets/baileys'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const handler = async (m, { conn, command, participants }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  const memberIds = participants.map(u => u.id)

  let ghosts = []

  for (let userId of memberIds) {
    if (userId === conn.user.jid) continue

    const userDb = global.db.data.users[userId] || {}
    const participant = participants.find(u => u.id === userId)

    const isAdmin = participant?.admin

    // 🔹 Detectar inactivos o sin datos
    if ((!userDb.chat || userDb.chat === 0) && !isAdmin) {
      if (userDb.whitelist === false || userDb.whitelist === undefined) {
        ghosts.push(userId)
      }
    }
  }

  if (ghosts.length === 0) {
    return conn.reply(m.chat, '🎌 Este grupo no tiene fantasmas activos.', m)
  }

  const list = ghosts.map(v => `@${v.split('@')[0]}`).join('\n')

  await conn.sendMessage(m.chat, {
    text:
      `💥 *REVISIÓN DE FANTASMAS*\n\n⚠️ Usuarios inactivos:\n${list}\n\n📌 Nota: detección basada en actividad del bot`,
    mentions: ghosts,
  })

  // 🔥 Solo listar
  if (command === 'fantasmas') return

  // 🔥 Kick fantasmas
  if (command === 'kickfantasmas') {
    const botIsAdmin = participants.find(p => p.id === conn.user.jid)?.admin

    if (!botIsAdmin) {
      return conn.reply(
        m.chat,
        '🤖 Necesito ser admin para eliminar usuarios.',
        m
      )
    }

    await conn.reply(m.chat, '🚨 Eliminando fantasmas...', m)

    const usersToKick = ghosts.filter(u => !areJidsSameUser(u, conn.user.jid))

    for (let user of usersToKick) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        await delay(3000)
      } catch (e) {
        console.log('No se pudo expulsar:', user)
      }
    }
  }
}

handler.tags = ['grupo']
handler.command = ['fantasmas', 'kickfantasmas']
handler.group = true
handler.admin = true

export default handler