/** ZIP non compresso, senza dipendenze: le immagini PNG sono già compresse.
 * I nomi UTF-8 e il CRC consentono l'apertura anche con Esplora file. */
export function creaZip(files: { nome: string; dati: Uint8Array }[]): Blob {
  const encoder = new TextEncoder();
  const parti: Uint8Array<ArrayBuffer>[] = [];
  const indice: Uint8Array<ArrayBuffer>[] = [];
  let offset = 0;
  for (const file of files) {
    const nome = encoder.encode(file.nome);
    const dati = new Uint8Array(file.dati);
    let crc = 0xffffffff;
    for (const byte of dati) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const header = new Uint8Array(30 + nome.length);
    const h = new DataView(header.buffer);
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x0800, true);
    h.setUint16(12, 33, true); // 1 gennaio 1980, data ZIP minima valida
    h.setUint32(14, crc, true);
    h.setUint32(18, dati.length, true);
    h.setUint32(22, dati.length, true);
    h.setUint16(26, nome.length, true);
    header.set(nome, 30);
    const central = new Uint8Array(46 + nome.length);
    const c = new DataView(central.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint16(14, 33, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, dati.length, true);
    c.setUint32(24, dati.length, true);
    c.setUint16(28, nome.length, true);
    c.setUint32(42, offset, true);
    central.set(nome, 46);
    parti.push(header, dati);
    indice.push(central);
    offset += header.length + dati.length;
  }
  const fine = new Uint8Array(22);
  const e = new DataView(fine.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true);
  e.setUint16(10, files.length, true);
  e.setUint32(12, indice.reduce((n, p) => n + p.length, 0), true);
  e.setUint32(16, offset, true);
  return new Blob([...parti, ...indice, fine], { type: "application/zip" });
}
