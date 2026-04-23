import { spawn } from 'child_process'
import fs from 'fs'
import fetch from 'node-fetch'
import yts from 'yt-search'
import Jimp from 'jimp'
import axios from 'axios'

const name = 'Descargas - black clover'

async function resizeImage(buffer, size = 300) {
  const img = await Jimp.read(buffer)
  return img.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
}

async function validateUrl(url) {
  if (!url) return null
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) return url
    return null
  } catch {
    return null
  }
}

async function getFallbackMp3(videoUrl, videoId) {
  try {
    const ryuResponse = await axios.get(`https://api.ryuzei.xyz/dl/ytmp3?url=${encodeURIComponent(videoUrl)}&key=Corvette`)
    const ryuLink = ryuResponse.data.url
    const ryuValid = await validateUrl(ryuLink)
    if (ryuValid) return ryuValid
  } catch {}

  const apiSources = [
    {
      name: 'BetaBotz',
      fn: () => axios
        .get(`https://api.betabotz.eu.org/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=Btz-b2H2x`)
        .then(r => r.data.result?.mp3 || r.data.result?.download?.url)
    },
    {
      name: 'Sylphy',
      fn: () => axios
        .get(`https://sylphy.xyz/download/v3/ytmp3?url=${videoId}&api_key=Killua-Wa`)
        .then(r => r.data.result?.download?.url || r.data.result?.url)
    },
    {
      name: 'Adonix',
      fn: () => axios
        .get(`https://api-adonix.ultraplus.click/download/ytaudio?apikey=Yuki-WaBot&url=${encodeURIComponent(videoUrl)}`)
        .then(r => r.data?.result?.url || r.data?.data?.url || r.data?.url)
    },
    {
      name: 'Vreden',
      fn: () => axios
        .get(`https://api.vreden.web.id/api/v1/download/youtube/audio?url=${encodeURIComponent(videoUrl)}`)
        .then(r => r.data.result?.download?.url)
    },
    {
      name: 'Stellar',
      fn: () => axios
        .get(`https://api.stellarwa.xyz/dl/ytdl?url=${encodeURIComponent(videoUrl)}&format=mp3&key=YukiWaBot`)
        .then(r => r.data.result?.download || r.data.result)
    }
  ]

  const errors = []

  for (const api of apiSources) {
    try {
      const link = await api.fn()
      const validLink = await validateUrl(link)
      if (validLink) return validLink
    } catch (e) {
      errors.push(`${api.name}: ${e.message}`)
    }
  }

  throw new Error(`Detalles:\n${errors.join('\n')}`)
}

const yt = {
  static: Object.freeze({
    baseUrl: 'https://cnv.cx',
    headers: {
      'accept-encoding': 'gzip, deflate, br, zstd',
      origin: 'https://frame.y2meta-uk.com',
      'user-agent': 'Mozilla/5.0'
    }
  }),
  resolveConverterPayload(link, f = '128k') {
    const formatos = ['128k', '320k', '144p', '240p', '360p', '720p', '1080p']
    if (!formatos.includes(f)) throw Error('Formato inválido')
    const tipo = f.endsWith('k') ? 'mp3' : 'mp4'
    return {
      link,
      format: tipo,
      audioBitrate: tipo === 'mp3' ? f.replace('k', '') : '128',
      videoQuality: tipo === 'mp4' ? f.replace('p', '') : '720',
      filenameStyle: 'pretty',
      vCodec: 'h264'
    }
  },
  sanitizeFileName(n) {
    if (!n) return 'file.mp3'
    const ext = n.includes('.') ? n.match(/\.[^.]+$/)?.[0] || '.mp3' : '.mp3'
    const base = n.replace(ext, '').replace(/[^A-Za-z0-9]/g, '_').replace(/_+/g, '_').toLowerCase()
    return base + ext
  },
  async getBuffer(u) {
    const r = await fetch(u)
    if (!r.ok) throw Error('No se pudo descargar')
    return Buffer.from(await r.arrayBuffer())
  },
  async getKey() {
    const r = await fetch(this.static.baseUrl + '/v2/sanity/key', { headers: this.static.headers })
    const j = await r.json().catch(() => ({}))
    if (!j?.key) throw Error('No se obtuvo key')
    return j
  },
  async convert(u, f) {
    const { key } = await this.getKey()
    const p = this.resolveConverterPayload(u, f)
    const r = await fetch(this.static.baseUrl + '/v2/converter', {
      method: 'post',
      headers: { ...this.static.headers, key },
      body: new URLSearchParams(p)
    })
    const j = await r.json().catch(() => ({}))
    if (!j?.url) throw Error('Error en conversión')
    return j
  },
  async download(u, f) {
    const { url, filename } = await this.convert(u, f)
    const buffer = await this.getBuffer(url)
    return { buffer, fileName: this.sanitizeFileName(filename) }
  }
}

async function convertToFast(buffer) {
  const tempIn = './temp_in_' + Date.now() + '.mp4'
  const tempOut = './temp_out_' + Date.now() + '.mp4'
  fs.writeFileSync(tempIn, buffer)

  await new Promise((res, rej) => {
    const ff = spawn('ffmpeg', ['-y', '-i', tempIn, '-c', 'copy', '-movflags', 'faststart', tempOut])
    ff.on('error', rej)
    ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg error')))
  })

  const out = fs.readFileSync(tempOut)
  fs.unlinkSync(tempIn)
  fs.unlinkSync(tempOut)
  return out
}

const handler = async (m, { conn, args, command }) => {
  if (!args[0]) return m.reply('Pasa un link o nombre')
  await m.react('⌛')

  let url, title, thumbnail

  if (args[0].includes('youtu')) {
    const id = args[0].includes('v=') 
      ? args[0].split('v=')[1]?.split('&')[0] 
      : args[0].split('/').pop()

    if (!id) return m.reply('Link inválido')

    const info = await yts({ videoId: id }).catch(() => null)
    if (!info) return m.reply('No se pudo obtener info')

    url = 'https://www.youtube.com/watch?v=' + id
    title = info.title || 'Sin título'
    thumbnail = info.thumbnail
  } else {
    const r = await yts.search(args.join(' ')).catch(() => ({ videos: [] }))
    if (!r.videos || !r.videos.length) return m.reply('No encontrado')
    const v = r.videos[0]
    url = v.url
    title = v.title
    thumbnail = v.thumbnail
  }

  let thumb = null
  try {
    thumb = await resizeImage(
      Buffer.from(await (await fetch(thumbnail)).arrayBuffer())
    )
  } catch {
    thumb = null
  }

  let thumb3 = null
  try {
    const res3 = await fetch('https://raw.githubusercontent.com/JTxs00/uploads/main/1776310123337.jpeg')
    thumb3 = Buffer.from(await res3.arrayBuffer())
  } catch {
    thumb3 = null
  }

  const fkontak = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net'
    },
    message: {
      documentMessage: {
        title: `🎬「 ${title} 」⚡`,
        fileName: name,
        jpegThumbnail: thumb3 || undefined
      }
    }
  }

  if (command === 'ytmp3') {
    let buffer, fileName

    try {
      const res = await yt.download(url, '128k')
      buffer = res.buffer
      fileName = res.fileName
    } catch {
      const fallbackUrl = await getFallbackMp3(url, url.split('v=')[1]?.split('&')[0])
      buffer = await yt.getBuffer(fallbackUrl)
      fileName = 'audio.mp3'
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: fileName.endsWith('.mp3') ? fileName : fileName + '.mp3',
        ptt: false,
        jpegThumbnail: thumb || undefined
      },
      { quoted: fkontak }
    )
  }

  if (command === 'ytmp4doc') {
    let { buffer, fileName } = await yt.download(url, '720p')
    buffer = await convertToFast(buffer)
    await conn.sendMessage(
      m.chat,
      {
        document: buffer,
        mimetype: 'video/mp4',
        fileName: fileName.endsWith('.mp4') ? fileName : fileName + '.mp4',
        jpegThumbnail: thumb || undefined
      },
      { quoted: fkontak }
    )
  }

  await m.react('✅')
}

handler.command = ['ytmp3', 'ytmp4doc']
handler.tags = ['descargas']
handler.help = ['ytmp3 <link|nombre>', 'ytmp4doc <link|nombre>']

export default handler