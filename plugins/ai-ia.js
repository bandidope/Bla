import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const quoted = m.quoted || {}
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  const isQuotedImage = mime.startsWith('image')
  const username = conn.getName(m.sender)

  const basePrompt =
    `Tu nombre es asta-Bot, creado por The Carlos. Hablas español. ` +
    `Te diriges al usuario como ${username}. Eres amigable, divertida y te gustan las explosiones.`

  if (isQuotedImage) {
    try {
      const img = await quoted.download?.()
      if (!img) return conn.reply(m.chat, '🚩 No se pudo descargar la imagen.', m)

      const content = '¿Qué se observa en esta imagen?'
      const imageAnalysis = await fetchImageBuffer(content, img)

      const query = 'Describe la imagen y explica lo que sucede.'
      const prompt = `${basePrompt}. Imagen analizada: ${imageAnalysis?.result || 'sin resultado'}`

      const res = await chatEverywhereAPI(query, username, prompt)

      return conn.reply(m.chat, res || 'No hubo respuesta de la IA.', m)

    } catch (e) {
      console.error('error imagen:', e)
      return conn.reply(m.chat, '🚩 Error al analizar la imagen.', m)
    }
  }

  if (!text) {
    return conn.reply(
      m.chat,
      `🍟 Ingresa tu petición\nEjemplo: ${usedPrefix + command} hola`,
      m
    )
  }

  try {
    await m.react?.('💬')

    const prompt = `${basePrompt}. Responde: ${text}`
    const res = await chatEverywhereAPI(text, username, prompt)

    return conn.reply(m.chat, res || 'Sin respuesta.', m)

  } catch (e) {
    console.error('error ia:', e)
    return conn.reply(m.chat, 'Error: intenta más tarde.', m)
  }
}

handler.help = ['chatgpt <texto>', 'ia <texto>']
handler.tags = ['ai']
handler.group = true
handler.register = true
handler.command = ['ia', 'chatgpt']

export default handler

async function fetchImageBuffer(content, imageBuffer) {
  try {
    const { data } = await axios.post(
      'https://Luminai.my.id',
      { content, imageBuffer },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return data
  } catch (e) {
    console.error('error luminai:', e)
    throw e
  }
}

async function chatEverywhereAPI(text, username, logic) {
  try {
    const { data } = await axios.post(
      'https://chateverywhere.app/api/chat/',
      {
        model: {
          id: 'gpt-4',
          name: 'GPT-4',
          maxLength: 32000,
          tokenLimit: 8000,
          completionTokenLimit: 5000
        },
        messages: [
          { role: 'user', content: text }
        ],
        prompt: logic,
        temperature: 0.5
      },
      {
        headers: {
          'Accept': '*/*',
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36'
        }
      }
    )

    return data
  } catch (e) {
    console.error('error chat api:', e)
    throw e
  }
}