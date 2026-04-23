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

let handler = async (m, { conn, args }) => {
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

        if (!Array.isArray(character.img) || character.img.length === 0) {
            return await conn.reply(
                m.chat,
                `《✧》No se encontraron imágenes para *${character.name || 'Desconocido'}*.`,
                m
            )
        }

        const randomImage = character.img[Math.floor(Math.random() * character.img.length)]

        const message = `❀ Nombre » *${character.name || 'Desconocido'}*
⚥ Género » *${character.gender || 'N/A'}*
❖ Fuente » *${character.source || 'Desconocida'}*`

        await conn.sendFile(
            m.chat,
            randomImage,
            `${character.name || 'character'}.jpg`,
            message,
            m
        )

    } catch (error) {
        await conn.reply(
            m.chat,
            `✘ Error al cargar la imagen del personaje: ${error.message}`,
            m
        )
    }
}

handler.help = ['wimage <nombre del personaje>']
handler.tags = ['anime']
handler.command = ['charimage', 'wimage', 'waifuimage']
handler.group = true

export default handler