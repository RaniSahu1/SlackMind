import fs from "fs/promises";

import axios from "axios";

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

export async function downloadSlackFile(
  fileUrl,
  botToken,
  outputPath
) {
  const response = await axios.get(fileUrl, {
    responseType: "arraybuffer",

    headers: {
      Authorization: `Bearer ${botToken}`,
    },

    beforeRedirect: (options) => {
      if (
        options.protocol === "https:" &&
        options.hostname === "slackmindgroup.slack.com"
      ) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${botToken}`,
        };
      }
    },
  });

  await fs.writeFile(outputPath, response.data);

  console.log(
    `📥 PDF downloaded: ${outputPath}`
  );

  return outputPath;
}