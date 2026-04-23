// Código creado x The Carlos 👑
// No olvides dejar créditos

import fs from 'fs'
import path from 'path'
import Jimp from 'jimp'

const menuDir = './media/menu'
if (!fs.existsSync(menuDir)) fs.mkdirSync(menuDir, { recursive: true })

function getMenuMediaFile(botJid) {
  const botId = botJid.replace(/[:@.]/g, '_')
  return path.join(menuDir, `menuMedia_${botId}.json`)
}

function loadMenuMedia(botJid) {
  const file = getMenuMediaFile(botJid)
  if (!fs.existsSync(file)) return {}

  try {
    return JSON.parse(fs.readFileSync(file))
  } catch (e) {
    console.warn('Error leyendo menuMedia:', e)
    return {}
  }
}

function saveMenuMedia(botJid, data) {
  fs.writeFileSync(getMenuMediaFile(botJid), JSON.stringify(data, null, 2))
}

const handler = async (m, { conn, command, usedPrefix, text }) => {
  const isSubBot =
    [conn.user.jid, ...global.owner.map(([n]) => `${n}@s.whatsapp.net`)]
      .includes(m.sender)

  if (!isSubBot) {
    return m.reply(`El comando *${command}* solo puede ser usado por el SubBot.`)
  }

  const botJid = conn.user.jid
  let menuMedia = loadMenuMedia(botJid)

  try {

    switch (command) {

      case 'setmenuimg': {
        const q = m.quoted || m
        const mime = (q.msg || q).mimetype || ''

        if (!/image\/(png|jpe?g)|video\/mp4/.test(mime)) {
          return m.reply('Responde a una imagen (jpg/png) o video (mp4) válido.')
        }

        const media = await q.download()
        if (!media) return m.reply('No se pudo descargar el archivo.')

        const ext = mime.includes('video') ? '.mp4' : '.jpg'
        const filePath = path.join(menuDir, `${botJid.replace(/[:@.]/g, '_')}${ext}`)

        fs.writeFileSync(filePath, media)

        menuMedia = typeof menuMedia === 'object' ? menuMedia : {}

        if (mime.includes('video')) menuMedia.video = filePath
        else menuMedia.thumbnail = filePath

        saveMenuMedia(botJid, menuMedia)

        return m.reply(`✅ ${mime.includes('video') ? 'Video' : 'Imagen'} del menú actualizado.`)
      }

      case 'setmenutitle': {
        if (!text) return m.reply('❎ Ingresa el nuevo título del menú.')

        menuMedia = menuMedia || {}
        menuMedia.menuTitle = text

        saveMenuMedia(botJid, menuMedia)

        return m.reply(`✅ Título actualizado:\n${text}`)
      }

      case 'subpfp':
      case 'subimagen': {
        const q = m.quoted || m
        const mime = (q.msg || q).mimetype || ''

        if (!/image\/(png|jpe?g)/.test(mime)) {
          return m.reply('Envía una imagen válida.')
        }

        const media = await q.download()
        const image = await Jimp.read(media)
        const buffer = await image.getBufferAsync(Jimp.MIME_JPEG)

        await conn.updateProfilePicture(conn.user.id, buffer)

        return m.reply('✅ Foto de perfil actualizada.')
      }

      case 'substatus':
      case 'subbio': {
        if (!text) return m.reply('❎ Ingresa la nueva biografía.')

        await conn.updateProfileStatus(text)

        return m.reply(`✅ Biografía actualizada:\n${text}`)
      }

      case 'subusername':
      case 'subuser': {
        if (!text) return m.reply('❎ Ingresa el nuevo nombre.')

        await conn.updateProfileName(text)

        return m.reply(`✅ Nombre actualizado:\n${text}`)
      }

      case 'personalizar': {
        return m.reply(`
✙ *Opciones de Personalización*

▢ ${usedPrefix}setmenuimg
↳ Cambia imagen/video del menú

▢ ${usedPrefix}setmenutitle <texto>
↳ Cambia título del menú

▢ ${usedPrefix}subpfp
↳ Cambia foto de perfil del SubBot

▢ ${usedPrefix}substatus <texto>
↳ Cambia biografía

▢ ${usedPrefix}subusername <texto>
↳ Cambia nombre del SubBot

📢 Canal:
https://whatsapp.com/channel/0029VbB36XC8aKvQevh8Bp04
`.trim())
      }

    }

  } catch (e) {
    console.error(e)
    m.reply(`⚠︎ Error:\n${e.message}`)
  }
}

handler.help = [
  'personalizar','setmenuimg','setmenutitle',
  'subpfp','subimagen','substatus','subbio',
  'subusername','subuser'
]

handler.tags = ['subbot']
handler.command = [
  'personalizar','setmenuimg','setmenutitle',
  'subpfp','subimagen','substatus','subbio',
  'subusername','subuser'
]

export default handler