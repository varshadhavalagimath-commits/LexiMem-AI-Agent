import fitz  # PyMuPDF
import os

def extract_pdf_content(file_path: str):
    """
    Extracts text, metadata, and detects scanned/image-based PDF documents.
    Does not silently pretend scanned documents were extracted successfully.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    doc = fitz.open(file_path)
    total_pages = len(doc)
    
    extracted_pages = []
    total_chars = 0
    scanned_pages_count = 0
    
    for page_num in range(total_pages):
        page = doc[page_num]
        text = page.get_text("text").strip()
        image_list = page.get_images(full=True)
        char_count = len(text)
        total_chars += char_count
        
        # Heuristic: A page with under 50 characters but containing image(s) is likely scanned
        is_page_scanned = (char_count < 50 and len(image_list) > 0)
        if is_page_scanned:
            scanned_pages_count += 1
            
        extracted_pages.append({
            "pageNumber": page_num + 1,
            "text": text,
            "charCount": char_count,
            "imageCount": len(image_list),
            "isScanned": is_page_scanned
        })
        
    full_text = "\n\n--- Page Break ---\n\n".join([p["text"] for p in extracted_pages if p["text"]])
    
    # Determine overall document scan status
    avg_chars_per_page = total_chars / max(total_pages, 1)
    is_scanned = (avg_chars_per_page < 40 and total_pages > 0) or (scanned_pages_count > (total_pages / 2))
    ocr_required = is_scanned
    
    status_message = "Text extraction successful."
    if ocr_required:
        status_message = "Scanned document detected. Optical Character Recognition (OCR) is required to process non-text layers."

    metadata = {
        "title": doc.metadata.get("title", ""),
        "author": doc.metadata.get("author", ""),
        "subject": doc.metadata.get("subject", ""),
        "creator": doc.metadata.get("creator", ""),
        "producer": doc.metadata.get("producer", ""),
        "pageCount": total_pages
    }
    
    doc.close()
    
    return {
        "success": True,
        "isScanned": is_scanned,
        "ocrRequired": ocr_required,
        "statusMessage": status_message,
        "pageCount": total_pages,
        "totalCharacters": total_chars,
        "fullText": full_text,
        "pages": extracted_pages,
        "metadata": metadata
    }
