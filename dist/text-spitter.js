"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitText = void 0;
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
async function splitText(text) {
    try {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 3800,
            chunkOverlap: 1,
        });
        const output = await splitter.createDocuments([text]);
        return output[0].pageContent;
    }
    catch (error) {
        console.log("Document splitter error");
        return (text.substring(0, 3000));
    }
}
exports.splitText = splitText;
//# sourceMappingURL=text-spitter.js.map