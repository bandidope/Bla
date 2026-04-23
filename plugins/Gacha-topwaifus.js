import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters.json';

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('《✧》No se pudo cargar el archivo characters.json.');
    }
}

let handler = async (m, { conn, args }) => {
    try {
        const characters = await loadCharacters();

        if (!Array.isArray(characters) || characters.length === 0) {
            return await conn.reply(m.chat, '✘ No hay personajes registrados.', m);
        }

        const page = Math.max(parseInt(args[0]) || 1, 1);
        const itemsPerPage = 10;

        const sortedCharacters = [...characters].sort(
            (a, b) => Number(b.value || 0) - Number(a.value || 0)
        );

        const totalCharacters = sortedCharacters.length;
        const totalPages = Math.ceil(totalCharacters / itemsPerPage);

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        const charactersToShow = sortedCharacters.slice(startIndex, endIndex);

        if (charactersToShow.length === 0) {
            return await conn.reply(m.chat, '✘ Página vacía o inexistente.', m);
        }

        let message = '❀ *Personajes con más valor:*\n\n';

        charactersToShow.forEach((character, index) => {
            message += `✰ ${startIndex + index + 1} » *${character.name || 'Desconocido'}*\n`;
            message += `   → Valor: *${character.value || 0}*\n\n`;
        });

        message += `> • Página *${page}* de *${totalPages}*.`;

        await conn.reply(m.chat, message.trim(), m);

    } catch (error) {
        await conn.reply(
            m.chat,
            `✘ Error al cargar los personajes: ${error.message}`,
            m
        );
    }
};

handler.help = ['topwaifus [página]'];
handler.tags = ['anime'];
handler.command = ['topwaifus', 'waifustop', 'waifusboard'];
handler.group = true;
handler.register = true;

export default handler;