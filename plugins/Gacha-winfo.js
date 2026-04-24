import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters.json';
const haremFilePath = './src/database/harem.json';

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('No se pudo cargar el archivo characters.json.');
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

let handler = async (m, { conn, args }) => {
    if (!args.length) {
        return await conn.reply(
            m.chat,
            '《✧》Debes especificar un personaje para ver su información.\n> Ejemplo » *#winfo Aika Sano*',
            m
        );
    }

    const characterName = args.join(' ').toLowerCase().trim();

    try {
        const characters = await loadCharacters();

        if (!Array.isArray(characters) || characters.length === 0) {
            return await conn.reply(m.chat, '✘ No hay personajes registrados.', m);
        }

        const character = characters.find(c =>
            (c?.name || '').toLowerCase().trim() === characterName
        );

        if (!character) {
            return await conn.reply(
                m.chat,
                `《✧》No se encontró el personaje *${characterName}*.`,
                m
            );
        }

        const harem = await loadHarem();

        const userEntry = harem.find(entry =>
            entry?.characterId === character.id
        );

        const ownerId = userEntry?.userId || null;

        const statusMessage = ownerId
            ? `Reclamado por @${ownerId.split('@')[0]}`
            : 'Libre';

        const message = `❀ Nombre » *${character.name || 'Desconocido'}*
⚥ Género » *${character.gender || 'N/A'}*
✰ Valor » *${character.value || 0}*
♡ Estado » ${statusMessage}
❖ Fuente » *${character.source || 'Desconocida'}*`;

        const mentions = ownerId ? [ownerId] : [];

        await conn.reply(
            m.chat,
            message,
            m,
            { mentions }
        );

    } catch (error) {
        await conn.reply(
            m.chat,
            `✘ Error al cargar la información del personaje: ${error.message}`,
            m
        );
    }
};

handler.help = ['charinfo <nombre>', 'winfo <nombre>', 'waifuinfo <nombre>'];
handler.tags = ['anime'];
handler.command = ['charinfo', 'winfo', 'waifuinfo'];
handler.group = true;


export default handler;