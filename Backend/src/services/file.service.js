import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

const MAX_EXTRACTED_CHARS = 8000;

/**
 * Extract plain text from an uploaded file so it can be included in the
 * AI prompt as context. Supports PDF, DOCX, and plain text files.
 *
 * @param {{ name: string, type: string, data: string }} file
 *   file.data is a base64 data URL (e.g. "data:application/pdf;base64,...")
 * @returns {Promise<string>} extracted, truncated text
 */
export async function extractTextFromFile(file) {
    const base64 = file.data.split(",")[ 1 ] || file.data;
    const buffer = Buffer.from(base64, "base64");

    let text = "";

    if (file.type === "application/pdf") {
        const result = await pdfParse(buffer);
        text = result.text;
    } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
    } else {
        // Plain text and anything else readable as UTF-8
        text = buffer.toString("utf-8");
    }

    text = text.trim();

    if (text.length > MAX_EXTRACTED_CHARS) {
        text = text.slice(0, MAX_EXTRACTED_CHARS) + "\n\n[Content truncated — file is longer than shown here]";
    }

    return text;
}