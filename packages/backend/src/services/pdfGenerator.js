import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_DIR = path.join(__dirname, '..', '..', 'data', 'pdfs');

// Ensure the PDF output directory exists
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

/**
 * Convert an HTML string to PDF and save it to disk.
 * @param {string} html - Full HTML page string
 * @param {string} filename - Output filename (without path)
 * @returns {Promise<string>} Absolute path to the generated PDF file
 */
export async function generatePdf(html, filename) {
  const outputPath = path.join(PDF_DIR, filename);
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return outputPath;
}

export { PDF_DIR };
