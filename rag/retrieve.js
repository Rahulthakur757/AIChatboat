const getEmbedding = require("./embedding");
const cosineSimilarity = require("./cosine");

async function retrieveChunks(question, vectorStore) {

    const questionEmbedding = await getEmbedding(question);

    const scores = vectorStore.map(chunk => ({
        file: chunk.file,
        text: chunk.text,
        score: cosineSimilarity(questionEmbedding, chunk.embedding)
    }));

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, 3);
}

module.exports = retrieveChunks;