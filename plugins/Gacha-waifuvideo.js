import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters.json'
const haremFilePath = './src/database/harem.json'

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('❀ No se pudo cargar el archivo characters.json.')
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        return []
    }
}

let handler = async (m, { conn, command, args }) => {
    if (!args.length) {
        return await conn.reply(m.chat, `《✧》Por favor, proporciona el nombre de un personaje.`, m)
    }

    const characterName = args.join(' ').toLowerCase().trim()

    try {
        const characters = await loadCharacters()

        if (!Array.isArray(characters) || characters.length === 0) {
            return await conn.reply(m.chat, '✘ No hay personajes registrados.', m)
        }

        const character = characters.find(c =>
            (c?.name || '').toLowerCase().trim() === characterName
        )

        if (!character) {
            return await conn.reply(
                m.chat,
                `《✧》No se ha encontrado el personaje *${characterName}*. Asegúrate de que el nombre esté correcto.`,
                m
            )
        }

        if (!Array.isArray(character.vid) || character.vid.length === 0) {
            return await conn.reply(
                m.chat,
                `《✧》No se encontró un video para *${character.name || 'Desconocido'}*.`,
                m
            )
        }

        const randomVideo = character.vid[Math.floor(Math.random() * character.vid.length)]

        const message = `❀ Nombre » *${character.name || 'Desconocido'}*
⚥ Género » *${character.gender || 'N/A'}*
❖ Fuente » *${character.source || 'Desconocida'}*`

        const sendAsGif = Math.random() < 0.5

        await conn.sendMessage(
            m.chat,
            {
                video: { url: randomVideo },
                gifPlayback: sendAsGif,
                caption: message
            },
            { quoted: m }
        )

    } catch (error) {
        await conn.reply(
            m.chat,
            `✘ Error al cargar el video del personaje: ${error.message}`,
            m
        )
    }
}

handler.help = ['wvideo <nombre del personaje>']
handler.tags = ['anime']
handler.command = ['charvideo', 'wvideo', 'waifuvideo']
handler.group = true

export default handler