const handler = m => m

export async function all() {
  try {
    const users = global.db.data.users || {}

    for (const [jid, user] of Object.entries(users)) {
      if (!user?.premium || !user?.premiumTime) continue
      if (user.premiumTime === 0) continue

      if (Date.now() >= user.premiumTime) {
        user.premiumTime = 0
        user.premium = false

        const fkontak = {
          key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast'
          },
          message: {
            contactMessage: {
              vcard:
                `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${jid.split('@')[0]}:${jid.split('@')[0]}\nEND:VCARD`
            }
          }
        }

        const textoo = `「✐」Tu tiempo premium ha expirado`

        await this.sendMessage(
          jid,
          { text: textoo, mentions: [jid] },
          { quoted: fkontak }
        ).catch(() => {})
      }
    }

  } catch (e) {
    console.error('error premium system:', e)
  }
}

export default handler