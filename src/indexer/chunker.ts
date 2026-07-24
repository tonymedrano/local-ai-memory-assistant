export interface Chunk {
  text: string;

  index: number;
}

export function chunkText(text: string, size = 1200): Chunk[] {
  const chunks = [];

  let index = 0;

  for (let i = 0; i < text.length; i += size) {
    chunks.push({
      text: text.slice(i, i + size),

      index,
    });

    index++;
  }

  return chunks;
}
