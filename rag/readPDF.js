const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

async function readAllPDFs() {

    const folderPath = path.join(__dirname, "../knowledge");
    const files = fs.readdirSync(folderPath);

    let documents = [];

    for (const file of files) {

        if (!file.endsWith(".pdf")) continue;

        try {

            const filePath = path.join(folderPath, file);
            const dataBuffer = fs.readFileSync(filePath);

            const pdfData = await pdf(dataBuffer);

            console.log("✅ Read:", file);

            documents.push({
                fileName: file,
                text: pdfData.text
            });

        } catch (err) {

            console.log("❌ Error reading:", file);
            console.log(err.message);

        }
    }

    return documents;
}

module.exports = readAllPDFs;