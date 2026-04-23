import { spawn } from "child_process"
import fs from "fs"
import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"

const name = "Descargas - black clover"

async function resizeImage(buffer, size = 300) {
  const img = await Jimp.read(buffer)
  return img.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
}

async function validateUrl(url) {
  if (!url) return null
  try {
    const res = await fetch(url, { method: "HEAD" })
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
      name: "BetaBotz",
      fn: () => axios
        .get(`https://api.betabotz.eu.org/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=Btz-b2H2x`)
        .then(r => r.data.result?.mp3 || r.data.result?.download?.url)
    },
    {
      name: "Sylphy",
      fn: () => axios
        .get(`https://sylphy.xyz/download/v3/ytmp3?url=${videoId}&api_key=Killua-Wa`)
        .then(r => r.data.result?.download?.url || r.data.result?.url)
    },
    {
      name: "Adonix",
      fn: () => axios
        .get(`https://api-adonix.ultraplus.click/download/ytaudio?apikey=Yuki-WaBot&url=${encodeURIComponent(videoUrl)}`)
        .then(r => r.data?.result?.url || r.data?.data?.url || r.data?.url)
    },
    {
      name: "Vreden",
      fn: () => axios
        .get(`https://api.vreden.web.id/api/v1/download/youtube/audio?url=${encodeURIComponent(videoUrl)}`)
        .then(r => r.data.result?.download?.url)
    },
    {
      name: "Stellar",
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

  throw new Error(`Detalles:\n${errors.join("\n")}`)
}

const yt = {
  static: Object.freeze({
    baseUrl: "https://cnv.cx",
    headers: {
      "accept-encoding": "gzip, deflate, br, zstd",
      origin: "https://frame.y2meta-uk.com",
      "user-agent": "Mozilla/5.0"
    }
  }),
  resolveConverterPayload(link, f = "128k") {
    if (!["128k", "320k"].includes(f)) throw Error("Formato inválido")
    return {
      link,
      format: "mp3",
      audioBitrate: f.replace("k", ""),
      filenameStyle: "pretty"
    }
  },
  sanitizeFileName(n) {
    if (!n) return "audio.mp3"
    const extMatch = n.match(/\.[^.]+$/)
    const ext = extMatch ? extMatch[0] : ".mp3"
    const base = n.replace(ext, "").replace(/[^A-Za-z0-9]/g, "_").replace(/_+/g, "_").toLowerCase()
    return base + ext
  },
  async getBuffer(u) {
    const r = await fetch(u)
    if (!r.ok) throw Error("No se pudo descargar")
    return Buffer.from(await r.arrayBuffer())
  },
  async getKey() {
    const r = await fetch(this.static.baseUrl + "/v2/sanity/key", { headers: this.static.headers })
    const j = await r.json().catch(() => ({}))
    if (!j?.key) throw Error("No key")
    return j
  },
  async convert(u, f) {
    const { key } = await this.getKey()
    const payload = this.resolveConverterPayload(u, f)
    const r = await fetch(this.static.baseUrl + "/v2/converter", {
      method: "post",
      headers: { ...this.static.headers, key },
      body: new URLSearchParams(payload)
    })
    const j = await r.json().catch(() => ({}))
    if (!j?.url) throw Error("Error conversión")
    return j
  },
  async download(u, f) {
    const { url, filename } = await this.convert(u, f)
    const buffer = await this.getBuffer(url)
    return { buffer, fileName: this.sanitizeFileName(filename) }
  }
}

const handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply("🎵 Pasa el link o nombre")
  await m.react("⌛")

  let url, title, thumbnail

  if (args[0].includes("youtu")) {
    const id = args[0].includes("v=") 
      ? args[0].split("v=")[1]?.split("&")[0] 
      : args[0].split("/").pop()

    if (!id) return m.reply("❌ Link inválido")

    const info = await yts({ videoId: id }).catch(() => null)
    if (!info) return m.reply("❌ No se pudo obtener info")

    url = "https://www.youtube.com/watch?v=" + id
    title = info.title || "Sin título"
    thumbnail = info.thumbnail
  } else {
    const search = await yts.search(args.join(" ")).catch(() => ({ videos: [] }))
    if (!search.videos || !search.videos.length) return m.reply("❌ No encontrado")
    const v = search.videos[0]
    url = v.url
    title = v.title
    thumbnail = v.thumbnail
  }

  let thumb = null
  try {
    thumb = await resizeImage(Buffer.from(await (await fetch(thumbnail)).arrayBuffer()))
  } catch {
    thumb = null
  }

  let thumb3 = null
  try {
    const res3 = await fetch("https://raw.githubusercontent.com/JTxs00/uploads/main/1776310123337.jpeg")
    thumb3 = Buffer.from(await res3.arrayBuffer())
  } catch {
    thumb3 = null
  }

  const fkontak = {
    key: { fromMe: false, participant: "0@s.whatsapp.net" },
    message: {
      documentMessage: {
        title: `🎵「 ${title} 」`,
        fileName: name,
        jpegThumbnail: thumb3 || undefined
      }
    }
  }

  let buffer, fileName

  try {
    const res = await yt.download(url, "128k")
    buffer = res.buffer
    fileName = res.fileName
  } catch {
    const fallbackUrl = await getFallbackMp3(url, url.split("v=")[1]?.split("&")[0])
    buffer = await yt.getBuffer(fallbackUrl)
    fileName = "audio.mp3"
  }

  await conn.sendMessage(
    m.chat,
    {
      document: buffer,
      mimetype: "audio/mpeg",
      fileName: fileName.endsWith(".mp3") ? fileName : fileName + ".mp3",
      jpegThumbnail: thumb || undefined
    },
    { quoted: fkontak }
  )

  await m.react("✅")
}

handler.command = ["ytmp3doc"]
handler.tags = ["descargas"]
handler.help = ["ytmp3doc <link|nombre>"]

export default handler