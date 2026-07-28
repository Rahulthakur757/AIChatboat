// require("dotenv").config();

// const OpenAI = require("openai");

// const client = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });

// const express = require("express");

// const app = express();

// app.use(express.static("public"));





// const PORT = process.env.PORT || 3000;


// app.use(express.json());


// app.get("/", (req, res) => {
//     res.sendFile(__dirname + "/public/index.html");
// });

// app.post("/api/chat", async (req, res) => {
//     try {
//         const { message } = req.body;

//         const response = await client.responses.create({
//             model: process.env.OPENAI_MODEL,
//             input: message
//         });

//         res.json({
//             success: true,
//             reply: response.output_text
//         });

//     } catch (error) {
//         console.error(error);

//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// });

// app.listen(PORT, (err) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(` Core Server engine deployed on: http://localhost:${PORT}`); 
//     }
// })










require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const readAllPDFs = require("./rag/readPDF");
const chunkText = require("./rag/chunkText");
const buildVectorStore = require("./rag/vectorStore");
const retrieveChunks = require("./rag/retrieve");

const app = express();

const PORT = process.env.PORT || 3000;

// -------------------- OpenAI --------------------

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// -------------------- Middleware --------------------

app.use(express.json());
app.use(express.static("public"));

// -------------------- Global Variables --------------------

let allChunks = [];
let vectorStore = [];

// -------------------- Home Route --------------------

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// -------------------- Chat Route --------------------

app.post("/api/chat", async (req, res) => {

    try {

        // Check if knowledge is loaded
        if (vectorStore.length === 0) {

            return res.status(503).json({
                success: false,
                reply: "Knowledge Base is loading. Please wait..."
            });

        }

        const { message } = req.body;

        // Retrieve top 3 similar chunks
        const context = await retrieveChunks(message, vectorStore);

        console.log("\n==============================");
        console.log("User Question:");
        console.log(message);

        console.log("\nRetrieved Chunks:");
        console.log(context);

        // Prompt
        const prompt = `
You are College Mitra AI.

Answer ONLY using the college knowledge below.

Rules:
1. Do not make up answers.
2. Use simple English.
3. If the answer is not available, reply:
"I don't have this information."

College Knowledge:

${context.map(item => item.text).join("\n\n")}

Student Question:

${message}

Answer:
`;

        const response = await client.responses.create({

            model: process.env.OPENAI_MODEL,

            input: prompt

        });

        res.json({

            success: true,

            reply: response.output_text

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            reply: "Internal Server Error"

        });

    }

});

// -------------------- Load Knowledge --------------------

(async () => {

    try {

        console.log("\nLoading College Knowledge...\n");

        const docs = await readAllPDFs();

        docs.forEach(doc => {

            const chunks = chunkText(doc.text);

            chunks.forEach(chunk => {

                allChunks.push({

                    file: doc.fileName,

                    text: chunk

                });

            });

        });

        console.log("Total Chunks:", allChunks.length);

        console.log("\nGenerating Embeddings...\n");

        vectorStore = await buildVectorStore(allChunks);

        console.log("\nVector Store Ready.");

        console.log("Total Vectors:", vectorStore.length);

        console.log("\nCollege AI is Ready.\n");

    } catch (err) {

        console.error("Knowledge Loading Error:");

        console.error(err);

    }

})();

// -------------------- Start Server --------------------

app.listen(PORT, () => {

    console.log(`Core Server Engine Running on http://localhost:${PORT}`);

});