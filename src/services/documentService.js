import fs from "fs/promises";

import { PDFParse } from "pdf-parse";

export async function readTextFile(filePath) {
  const content = await fs.readFile(
    filePath,
    "utf-8"
  );

  return content;
}

//  Read text from PDF
export async function readPdfFile(filePath) {
  const buffer = await fs.readFile(filePath);

  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  await parser.destroy();

  return result.text;
}

export function createChunks(
  text,
  chunkSize = 1000,
  overlap = 200
) {
  const chunks = [];

  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;

    chunks.push(
      text.slice(start, end)
    );

    //Move forward while keeping the overlap from the previous chunk
    start += chunkSize - overlap;
  }

  return chunks;
}