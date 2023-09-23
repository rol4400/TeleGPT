const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

async function splitText(text: string) {
    const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 3800,
    chunkOverlap: 1,
    });

    const output = await splitter.createDocuments([text]);

    return output;
}

export { splitText };