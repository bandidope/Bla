//código creado x The Carlos 👑 
//no quiten créditos 

import { areJidsSameUser } from '@whiskeysockets/baileys'

export async function before(m, { participants, conn }) {
  try {
    if (!m.isGroup) return

    const chat = global?.db?.data?.chats?.[m.chat]
    if (!chat?.antiBot2) return
    if (chat.__antiBot2Leaving) return

    const mainConn = global.mainBot?.user?.jid ? global.mainBot : global.conn
    if (!mainConn?.user?.jid || !conn?.user?.jid) return

    const mainJid = mainConn.user.jid
    const thisJid = conn.user.jid

    if (areJidsSameUser(mainJid, thisJid)) return

    const groupMetadata =
      conn.chats?.[m.chat]?.metadata ||
      await conn.groupMetadata?.(m.chat).catch(() => null)

    const list =
      Array.isArray(participants) && participants.length
        ? participants
        : groupMetadata?.participants || []

    const isBotPresent = list.some(p => {
      const pid = p?.id || p?.jid
      if (!pid) return false

      return (
        areJidsSameUser(pid, mainJid) ||
        areJidsSameUser(pid, thisJid)
      )
    })

    if (!isBotPresent) return

    chat.__antiBot2Leaving = true

    await conn.reply(
      m.chat,
      '✦ bot principal detectado en el grupo.\nMe retiro para evitar espam.',
      m
    )

    await conn.groupLeave(m.chat).catch(() => {})

  } catch (err) {
    console.error('antiBot2 error:', err)

    const chat = global?.db?.data?.chats?.[m.chat]
    if (chat) {
      setTimeout(() => {
        chat.__antiBot2Leaving = false
      }, 5000)
    }
  }
}