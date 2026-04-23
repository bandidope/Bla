//código creado x The Carlos 👑 

let handler = async (m, { conn, args }) => {
  const userId = m.sender

  global.db.data.users = global.db.data.users || {}
  let user = global.db.data.users[userId] =
    global.db.data.users[userId] || {}

  user.monedas = Number(user.monedas || 0)
  user.antirobo = user.antirobo || 0

  const tipo = (args[0] || '').toLowerCase()

  const config = {
    hora: { costo: 30000, duracion: 60 * 60 * 1000 },
    dia: { costo: 500000, duracion: 24 * 60 * 60 * 1000 },
    semana: { costo: 2000000, duracion: 7 * 24 * 60 * 60 * 1000 },
    mes: { costo: 5000000, duracion: 30 * 24 * 60 * 60 * 1000 }
  }

  if (!config[tipo]) {
    return conn.reply(
      m.chat,
      `✘ Uso incorrecto.\n\n` +
      `*#antirobo hora*\n*#antirobo dia*\n*#antirobo semana*\n*#antirobo mes*`,
      m
    )
  }

  const { costo, duracion } = config[tipo]

  if (user.monedas < costo) {
    return conn.reply(
      m.chat,
      `✘ No tienes suficientes monedas.\nNecesitas *${costo.toLocaleString()}* monedas.`,
      m
    )
  }

  user.monedas -= costo
  user.antirobo = Date.now() + duracion

  await conn.reply(
    m.chat,
    `✅ *AntiRobo activado (${tipo})*\n\n🛡 Protección activa hasta:\n${new Date(user.antirobo).toLocaleString()}`,
    m
  )
}

handler.help = ['antirobo <hora|dia|semana|mes>']
handler.tags = ['gacha']
handler.command = ['antirobo']

export default handler