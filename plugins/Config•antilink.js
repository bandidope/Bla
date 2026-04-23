let linkRegex =
  /(https?:\/\/(?:www\.)?(?:t\.me|telegram\.me|whatsapp\.com)\/\S+)|(https?:\/\/chat\.whatsapp\.com\/\S+)|(https?:\/\/whatsapp\.com\/channel\/\S+)/i

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  try {
    if (!m || !m.text) return true
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false

    const chat = global.db.data.chats[m.chat] ||= {}
    const settings = global.db.data.settings[conn.user.jid] ||= {}

    if (!chat.antiLink) return true
    if (!linkRegex.test(m.text)) return true
    if (!isBotAdmin) return true

    let metadata
    try {
      metadata = await conn.groupMetadata(m.chat)
    } catch {
      metadata = null
    }

    const sender = m.sender
    const number = sender.split('@')[0]

    const participant = metadata?.participants?.find(
      p => (p.id || p.jid) === sender
    )

    const isSuperAdmin = participant?.admin === 'superadmin'

    if (isSuperAdmin) {
      await conn.reply(
        m.chat,
        `⚔️ Anti-Link activo, pero eres creador del grupo. Te salvaste.`,
        m
      )
      return true
    }

    if (isAdmin) {
      await conn.reply(
        m.chat,
        `⚠️ Eres admin, no serás expulsado.`,
        m
      )
      return true
    }

    const inviteCode = await conn.groupInviteCode(m.chat).catch(() => null)
    const thisGroupLink = inviteCode
      ? `https://chat.whatsapp.com/${inviteCode}`
      : ''

    if (thisGroupLink && m.text.includes(thisGroupLink)) return true

    await conn.reply(
      m.chat,
      `📎 ALERTA DE ENLACE PROHIBIDO\n\n⚠️ @${number} envió un enlace.\n💀 Acción en proceso...`,
      m,
      { mentions: [sender] }
    )

    if (settings.restrict) {
      try {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant || sender
          }
        })

        await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
      } catch (e) {
        console.error('error anti-link remove:', e)
      }
    } else {
      await conn.reply(
        m.chat,
        `⚙️ Restricción desactivada, no puedo expulsar a @${number}`,
        m,
        { mentions: [sender] }
      )
    }

    return true
  } catch (e) {
    console.error('anti-link error:', e)
    return true
  }
}