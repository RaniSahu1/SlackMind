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
  chunkSize = 500
) {
  const chunks = [];

  for (
    let i = 0;
    i < text.length;
    i += chunkSize
  ) {
    chunks.push(
      text.slice(i, i + chunkSize)
    );
  }

  return chunks;
}