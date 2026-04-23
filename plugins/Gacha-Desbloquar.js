//código creado x The Carlos 👑 

let handler = async (m, { conn, args }) => {
  let db = global.db.data.users

  let sender = m.sender
  let user = db[sender] || (db[sender] = { monedas: 0, antirobo: 0, desbloqueo: 0 })

  let target = m.mentionedJid?.[0] || args[0]
  if (!target) return conn.reply(m.chat, 'tienes que mencionar a alguien', m)

  if (!db[target]) db[target] = { monedas: 0, antirobo: 0, desbloqueo: 0 }

  let victim = db[target]

  let cost = 100000
  let time = 3 * 60 * 1000

  if (user.monedas < cost) {
    return conn.reply(
      m.chat,
      `no tienes monedas suficientes\nnecesitas ${cost.toLocaleString()} para esto`,
      m
    )
  }

  user.monedas -= cost

  victim.desbloqueo = Date.now() + time
  victim.antirobo = 0

  return conn.reply(
    m.chat,
    `🔓 desbloqueaste a ${conn.getName(target)}\nquedó vulnerable por unos minutos`,
    m
  )
}

handler.help = ['desbloquear @user']
handler.tags = ['gacha']
handler.command = ['desbloquear']

export default handler