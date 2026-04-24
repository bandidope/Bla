import yts from "yt-search"

const handler = async (m, { conn, text, usedPrefix, command }) => {

if (!text) throw `❌ Ingresa una canción\n\nEjemplo:\n${usedPrefix + command} Farruko beba`

try {

let search = await yts(text)

if (!search?.all?.length) {
return m.reply('❌ No se encontraron resultados')
}

// 🔥 convertir resultados a rows
let rows = []

for (let v of search.all.slice(0, 10)) {
if (!v?.url) continue

rows.push({
title: v.title || 'Sin título',
id: `${usedPrefix}ytmp3 ${v.url}`,
description: `🎤 ${v.author?.name || 'Desconocido'} | ⏱️ ${v.timestamp || '??:??'}`
})
}

// ⚠️ estructura EXACTA como tu menú
const sections = [
{
title: '🎵 Resultados de búsqueda',
rows
}
]

const msg = {
viewOnceMessage: {
message: {
messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
interactiveMessage: {
body: {
text: `🎧 *Resultados para:* ${text}

Selecciona una canción:`
},
footer: {
text: 'Gengar Bot ☘️ - Sistema de Música'
},
header: {
type: 'IMAGE',
imageUrl: 'https://files.catbox.moe/8lfoj3.jpg',
title: '🎶 PLAYLIST'
},
nativeFlowMessage: {
buttons: [
{
name: 'single_select',
buttonParamsJson: JSON.stringify({
title: '📂 Elegir canción',
sections
})
}
]
}
}
}
}
}

// 🔥 ENVÍO IGUAL QUE TU MENÚ
await conn.relayMessage(m.chat, msg.viewOnceMessage.message, {})

m.react('🎵')

} catch (e) {
console.error('ERROR REAL:', e)
m.reply('❌ Error al buscar la canción')
}
}

handler.command = ['ytsearch']
export default handler