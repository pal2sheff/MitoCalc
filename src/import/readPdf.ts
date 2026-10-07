import type { PdfTextItem } from './parseMitolab'

/**
 * Чтение текстового слоя PDF прямо в браузере. Файл никуда не отправляется:
 * pdf.js загружается с CDN один раз, разбор идёт на компьютере врача.
 */
const PDFJS_VERSION = '4.10.38'
const PDFJS_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`
const WORKER_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`

interface PdfJs {
  GlobalWorkerOptions: { workerSrc: string }
  getDocument(src: { data: Uint8Array }): {
    promise: Promise<{
      numPages: number
      getPage(n: number): Promise<{ getTextContent(): Promise<{ items: { str?: string; transform?: number[]; width?: number }[] }> }>
    }>
  }
}

let pdfjsPromise: Promise<PdfJs> | null = null

function loadPdfJs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import(/* @vite-ignore */ PDFJS_URL).then((mod: PdfJs) => {
      mod.GlobalWorkerOptions.workerSrc = WORKER_URL
      return mod
    })
  }
  return pdfjsPromise
}

export async function readPdfTextItems(file: File): Promise<PdfTextItem[]> {
  const pdfjs = await loadPdfJs()
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const items: PdfTextItem[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    for (const it of content.items) {
      if (!it.str || !it.str.trim() || !it.transform) continue
      items.push({ str: it.str, x: it.transform[4], y: it.transform[5], width: it.width ?? 0, page: p })
    }
  }
  return items
}
