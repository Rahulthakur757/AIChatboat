const getEmbedding = require("./embedding");

async function buildVectorStore(chunks) {

    const vectors = [];

    for (const chunk of chunks) {

        console.log("Embedding:", chunk.file);

        const embedding = await getEmbedding(chunk.text);

        vectors.push({
            file: chunk.file,
            text: chunk.text,
            embedding
        });

    }

    console.log("Vector Store Ready.");

    return vectors;
}

module.exports = buildVectorStore;