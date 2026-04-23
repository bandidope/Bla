const handler = async (m, { conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin, isSuperAdmin }) => {
  if (!args[0] || isNaN(args[0])) {
    return conn.reply(
      m.chat,
      `🚩 Ingresa un prefijo de país válido.\nEjemplo: ${usedPrefix + command} 58`,
      m
    )
  }

  const prefix = args[0].replace(/[+]/g, '')
  const usersWithPrefix = participants
    .map(u => u.id)
    .filter(v => v && v !== conn.user.jid && v.startsWith(prefix))

  if (!usersWithPrefix.length) {
    return conn.reply(
      m.chat,
      `🚩 *No hay números con el prefijo +${prefix} en este grupo*`,
      m
    )
  }

  const mentionsList = usersWithPrefix.map(v => '⭔ @' + v.split('@')[0])
  const delay = ms => new Promise(res => setTimeout(res, ms))

  const botSettings = global.db.data.settings[conn.user.jid] || {}

  switch (command) {

    case 'listanum':
    case 'listnum': {
      return conn.reply(
        m.chat,
        `🚩 *Números con prefijo +${prefix} en el grupo:*\n\n` + mentionsList.join('\n'),
        m,
        { mentions: usersWithPrefix }
      )
    }

    case 'kicknum': {
      if (!botSettings.restrict) {
        return conn.reply(
          m.chat,
          '🚩 *Este comando está deshabilitado por el propietario del bot*',
          m
        )
      }

      if (!isBotAdmin) {
        return conn.reply(
          m.chat,
          `🤖 *EL BOT NO ES ADMIN*\n\n> Necesito permisos de administrador para ejecutar esta acción.`,
          m
        )
      }

      await conn.reply(
        m.chat,
        `🚩 *Iniciando expulsión de usuarios con prefijo +${prefix}...*`,
        m
      )

      const ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net'

      for (const user of usersWithPrefix) {
        if (
          user === ownerGroup ||
          user === conn.user.jid ||
          user === global.owner?.[0]?.[0] + '@s.whatsapp.net' ||
          user === isSuperAdmin
        ) continue

        try {
          await delay(2000)

          const res = await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

          if (res?.[0]?.status === 404) {
            await conn.reply(
              m.chat,
              `@${user.split('@')[0]} ya no está en el grupo.`,
              m,
              { mentions: [user] }
            )
          }

        } catch (e) {
          await conn.reply(
            m.chat,
            `✖️ Error eliminando a @${user.split('@')[0]}`,
            m,
            { mentions: [user] }
          )
        }

        await delay(5000)
      }

      return
    }
  }
}

handler.command = ['kicknum', 'listnum', 'listanum']
handler.group = true
handler.admin = true
handler.fail = null

export default handler