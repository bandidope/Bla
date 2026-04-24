import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
  const emoji = '⚠️'
  const rwait = '⏳'
  const done = '✅'
  const error = '❌'
  const dev = 'by Whois Yallico  👑'

  const text = args.join(' ')

  if (!text) {
    return conn.reply(m.chat, `${emoji} Ingresa un término de búsqueda en Pinterest.`, m)
  }

  await m.react(rwait)

  try {
    const res = await fetch(
      `https://anabot.my.id/api/search/pinterest?query=${encodeURIComponent(text)}&apikey=freeApikey`
    )

    const json = await res.json()

    if (!json.success || !json.data?.result?.length) {
      await m.react(error)
      return conn.reply(m.chat, `${emoji} Sin resultados para: ${text}`, m)
    }

    const results = json.data.result
    const pin = results[Math.floor(Math.random() * results.length)]

    const imageUrl =
      pin.images?.['736x']?.url ||
      pin.images?.['345x']?.url ||
      pin.images?.['236x']?.url

    if (!imageUrl) {
      await m.react(error)
      return conn.reply(m.chat, `${emoji} No se pudo obtener la imagen.`, m)
    }

    let txt = `乂  *P I N T E R E S T - S E A R C H*  乂\n\n`
    txt += `*» Búsqueda* : ${text}\n`
    if (pin.description) txt += `*» Descripción* : ${pin.description}\n`
    if (pin.native_creator?.full_name) txt += `*» Autor* : ${pin.native_creator.full_name}\n`
    if (pin.aggregated_pin_data?.aggregated_stats?.saves) txt += `*» Guardados* : ${pin.aggregated_pin_data.aggregated_stats.saves}\n`
    if (pin.created_at) txt += `*» Fecha* : ${pin.created_at}\n`
    txt += `\n> *${dev}*`

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption: txt
      },
      { quoted: m }
    )

    await m.react(done)

  } catch (e) {
    console.error(e)
    await m.react(error)
    conn.reply(m.chat, `${emoji} Error:\n${e.message}`, m)
  }
}

handler.help = ['pinterest', 'pin']
handler.tags = ['search']
handler.command = ['pinterest', 'pin']

export default handler