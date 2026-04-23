const userSpamData = {}

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, isPrems }) {
  try {
    const chat = global.db.data.chats[m.chat] ||= {}
    const bot = global.db.data.settings[conn.user.jid] ||= {}

    if (!bot.antiSpam) return
    if (!m.isGroup) return

    if (chat.modoadmin && (isAdmin || isOwner || isROwner)) return

    const user = global.db.data.users[m.sender] ||= {}
    const sender = m.sender
    const now = Date.now()

    const LIMIT_TIME = 5000
    const LIMIT_MSG = 10

    const RESET_1 = 30000
    const RESET_2 = 60000
    const RESET_3 = 120000

    userSpamData[sender] ||= {
      last: now,
      count: 0,
      level: 0
    }

    const data = userSpamData[sender]

    if (now - data.last <= LIMIT_TIME) {
      data.count++
    } else {
      data.count = 1
    }

    data.last = now

    if (data.count < LIMIT_MSG) return

    const mention = `@${sender.split('@')[0]}`

    if (data.level === 0) {
      data.level = 1
      user.banned = true

      await conn.reply(m.chat,
        `🚩 Mucho spam detectado\nUsuario: ${mention}`,
        m,
        { mentions: [sender] }
      )

      setTimeout(() => {
        if (data.level === 1) {
          data.level = 0
          user.banned = false
          data.count = 0
        }
      }, RESET_1)

      return
    }

    if (data.level === 1) {
      data.level = 2
      user.banned = true

      await conn.reply(m.chat,
        `⚠️ Segunda advertencia de spam\nUsuario: ${mention}`,
        m,
        { mentions: [sender] }
      )

      setTimeout(() => {
        if (data.level === 2) {
          data.level = 0
          user.banned = false
          data.count = 0
        }
      }, RESET_2)

      return
    }

    if (data.level >= 2) {
      await conn.reply(m.chat,
        `👺 Eliminado por spam\nUsuario: ${mention}`,
        m,
        { mentions: [sender] }
      )

      await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
        .catch(() => {})

      delete userSpamData[sender]
    }

  } catch (e) {
    console.error('anti spam error:', e)
  }
}

export default handler