const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const env = require('../config/env');

class DocumentProcessorClient {
  constructor() {
    this.serviceUrl = env.docProcessorUrl || 'http://localhost:8000';
  }

  async extractDocument(filePath, originalFilename = '') {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist at path: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();

    // 1. Try Python microservice if running
    try {
      const response = await axios.post(
        `${this.serviceUrl}/extract-path`,
        { file_path: path.resolve(filePath) },
        { timeout: 3500 }
      );
      if (response.data && response.data.success) {
        return {
          ...response.data,
          extractionSource: 'python_service',
        };
      }
    } catch (svcErr) {
      // Python service not running; smoothly use in-process node extractors
    }

    // 2. In-Process Node.js Extraction Fallback
    if (ext === '.pdf') {
      return this.extractPdfNode(filePath, originalFilename);
    } else if (ext === '.docx' || ext === '.doc') {
      return this.extractDocxNode(filePath, originalFilename);
    } else {
      throw new Error(`Unsupported document extension: ${ext}. Expected .pdf or .docx`);
    }
  }

  async extractPdfNode(filePath, originalFilename) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const fullText = (pdfData.text || '').trim();
    const pageCount = pdfData.numpages || 1;
    const totalChars = fullText.length;
    const avgCharsPerPage = totalChars / Math.max(pageCount, 1);

    // Prompt requirement: "Detect scanned PDFs and clearly indicate when OCR is required.
    // Do not silently pretend that scanned documents were processed successfully."
    const isScanned = avgCharsPerPage < 40 && pageCount > 0;
    const ocrRequired = isScanned;

    let statusMessage = 'Text successfully extracted via Native PDF Engine.';
    if (ocrRequired) {
      statusMessage = 'Scanned PDF detected. Text layer is empty or below readable threshold. Optical Character Recognition (OCR) is required.';
    }

    return {
      success: true,
      fullText,
      pageCount,
      totalCharacters: totalChars,
      isScanned,
      ocrRequired,
      statusMessage,
      extractionSource: 'node_native_pdf',
      metadata: {
        title: pdfData.info?.Title || originalFilename,
        author: pdfData.info?.Author || 'Unknown',
        pageCount,
      },
    };
  }

  async extractDocxNode(filePath, originalFilename) {
    const result = await mammoth.extractRawText({ path: filePath });
    const fullText = (result.value || '').trim();
    const totalChars = fullText.length;
    const estimatedPages = Math.max(1, Math.ceil(totalChars / 2500));

    return {
      success: true,
      fullText,
      pageCount: estimatedPages,
      totalCharacters: totalChars,
      isScanned: false,
      ocrRequired: false,
      statusMessage: 'DOCX text successfully extracted.',
      extractionSource: 'node_native_docx',
      metadata: {
        title: originalFilename,
        characterCount: totalChars,
      },
    };
  }
}

module.exports = new DocumentProcessorClient();
