import db from '../lib/database.js'

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
  try {
    if (!m.isGroup) return false

    const chat = global.db.data.chats[m.chat]
    if (!chat?.antifake) return false
    if (!isBotAdmin) return false

    const user = global.db.data.users[m.sender] ||= {}

    const prefijos = [
      '6','90','212','92','93','94','7','49','2','91','48'
    ]

    const numero = m.sender.replace(/\D/g, '')

    const esFake = prefijos.some(p => numero.startsWith(p))

    if (!esFake) return false

    user.block = true

    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      .catch(() => {})

    return true

  } catch (e) {
    console.error('error antifake:', e)
    return false
  }
}

export default handler