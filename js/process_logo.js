/**
 * ====================================================================
 * FREELINK - PROCESSADOR DE LOGO (EQUIVALENTE EM JAVASCRIPT / NODE.JS)
 * Substitui o process_logo.py mantendo rigorosamente a mesma lógica
 * e sem exigir dependências externas (utiliza fs e zlib nativos).
 * ====================================================================
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Tabela de CRC32 pré-calculada para geração dos chunks PNG
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

/**
 * Calcula o checksum CRC32 de um buffer
 * @param {Buffer} buf 
 * @returns {number}
 */
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Cria um chunk PNG padrão [Length, Type, Data, CRC]
 * @param {string} type 
 * @param {Buffer} data 
 * @returns {Buffer}
 */
function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

/**
 * Preditor Paeth para filtros de descompressão PNG
 */
function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * Processa a logo removendo o fundo branco e ajustando o texto escuro para branco
 * @param {string} inputPath Caminho da imagem original (padrão 'logo.png')
 */
function processLogo(inputPath = path.join(__dirname, '..', 'img', 'logo.png')) {
  const fullInputPath = path.resolve(inputPath);
  if (!fs.existsSync(fullInputPath)) {
    throw new Error('Arquivo não encontrado: ' + fullInputPath);
  }

  const fileBuf = fs.readFileSync(fullInputPath);
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatBuffers = [];

  while (offset < fileBuf.length) {
    const len = fileBuf.readUInt32BE(offset);
    const type = fileBuf.subarray(offset + 4, offset + 8).toString('ascii');
    const data = fileBuf.subarray(offset + 8, offset + 8 + len);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
    } else if (type === 'IDAT') {
      idatBuffers.push(data);
    }
    offset += 12 + len;
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatBuffers));
  const bytesPerPixel = 4; // RGBA
  const stride = width * bytesPerPixel;
  const rawRGBA = Buffer.alloc(width * height * bytesPerPixel);

  let srcOffset = 0;
  for (let y = 0; y < height; y++) {
    const filterType = decompressed[srcOffset++];
    const prevLineOffset = (y - 1) * stride;
    const currLineOffset = y * stride;

    for (let x = 0; x < stride; x++) {
      const rawByte = decompressed[srcOffset++];
      const a = x >= bytesPerPixel ? rawRGBA[currLineOffset + x - bytesPerPixel] : 0;
      const b = y > 0 ? rawRGBA[prevLineOffset + x] : 0;
      const c = (y > 0 && x >= bytesPerPixel) ? rawRGBA[prevLineOffset + x - bytesPerPixel] : 0;

      let val = 0;
      if (filterType === 0) val = rawByte;
      else if (filterType === 1) val = (rawByte + a) & 0xFF;
      else if (filterType === 2) val = (rawByte + b) & 0xFF;
      else if (filterType === 3) val = (rawByte + Math.floor((a + b) / 2)) & 0xFF;
      else if (filterType === 4) val = (rawByte + paethPredictor(a, b, c)) & 0xFF;
      else throw new Error('Tipo de filtro PNG desconhecido: ' + filterType);

      rawRGBA[currLineOffset + x] = val;
    }
  }

  // Aplicação da mesma lógica de processamento do Python
  const totalPixels = width * height;
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = rawRGBA[idx];
    const g = rawRGBA[idx + 1];
    const b = rawRGBA[idx + 2];

    // Métrica de brilho
    const brightness = (r + g + b) / 3.0;

    // Calcula transparência baseada na brancura
    // Fundo branco (brightness >= 245) vira alpha 0
    // Anti-alias edge: entre 220 e 245
    const new_a = Math.max(0, Math.min(255, ((250.0 - brightness) / 30.0) * 255.0));

    // Detecta texto preto/escuro ("Free") onde r, g, b são escuros
    // Queremos alterar o texto escuro para branco puro #FFFFFF
    const is_dark_text = (r < 80) && (g < 80) && (b < 80) && (new_a > 50);

    // Transição suave para anti-aliasing no texto escuro
    const is_grey_edge = (r < 180) && (g < 180) && (b < 180) &&
                         (Math.abs(r - g) < 25) && (Math.abs(g - b) < 25) &&
                         (new_a > 30);

    const mask_white = is_dark_text || is_grey_edge;

    rawRGBA[idx] = mask_white ? 255 : r;
    rawRGBA[idx + 1] = mask_white ? 255 : g;
    rawRGBA[idx + 2] = mask_white ? 255 : b;
    rawRGBA[idx + 3] = Math.round(new_a);
  }

  // Re-codifica os scanlines com filtro 0 (None)
  const outScanlines = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    outScanlines[y * (stride + 1)] = 0;
    rawRGBA.copy(outScanlines, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const deflated = zlib.deflateSync(outScanlines);
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const outPng = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);

  // Salva os arquivos de saída mantendo compatibilidade total
  fs.writeFileSync(path.join(__dirname, '..', 'img', 'logo.png'), outPng);
  fs.writeFileSync(path.join(__dirname, '..', 'img', 'logo-dark.png'), outPng);
  console.log('Logo processed successfully!');
}

if (require.main === module) {
  processLogo();
}

module.exports = { processLogo };
