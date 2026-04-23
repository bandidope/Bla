import similarity from 'similarity'

const threshold = 0.72
const RIDDLE_PREFIX = 'ⷮ'

const handler = (m) => m

handler.before = async function (m) {
  try {
    const id = m.chat

    const quoted = m.quoted
    const quotedText = quoted?.text || ''

    if (
      !quoted ||
      !quoted.fromMe ||
      !quoted.isBaileys ||
      typeof quotedText !== 'string' ||
      !new RegExp(`^${RIDDLE_PREFIX}`, 'i').test(quotedText)
    ) return true

    this.tekateki ||= {}

    if (!this.tekateki[id]) {
      return m.reply('⚠️ El acertijo ya expiró o fue resuelto.')
    }

    const data = this.tekateki[id]
    const msgRef = data?.[0]
    const json = data?.[1]
    const reward = data?.[2]

    if (!msgRef || !json?.response) return true

    const user = global.db.data.users[m.sender] ||= { monedas: 0 }

    const answer = (m.text || '').toLowerCase().trim()
    const correct = json.response.toLowerCase().trim()

    if (m.quoted.id !== msgRef.id) return true

    if (answer === correct) {
      user.monedas += reward

      await m.reply(
        `🧠✅ ¡Correcto, ejecutor!\n+${reward} 🪙 Monedas del Sistema`
      )

      clearTimeout(data[3])
      delete this.tekateki[id]

    } else if (similarity(answer, correct) >= threshold) {
      await m.reply('🤏 Estás muy cerca del núcleo...')
    } else {
      await m.reply('❌ Incorrecto. Intenta de nuevo.')
    }

    return true

  } catch (e) {
    console.error('error tekateki:', e)
    return true
  }
}

handler.exp = 0

export default handler