function searchChunks(chunks, question) {

    question = question.toLowerCase();

    let bestChunk = "";
    let bestScore = 0;

    for (const chunk of chunks) {

        let score = 0;

        const words = question.split(" ");

        for (const word of words) {

            if (chunk.text.toLowerCase().includes(word)) {
                score++;
            }

        }

        if (score > bestScore) {

            bestScore = score;

            bestChunk = chunk.text;
        }

    }

    if (bestScore === 0) {

        return "Sorry, I couldn't find this information in the college knowledge base.";

    }

    return bestChunk;

}

module.exports = searchChunks;