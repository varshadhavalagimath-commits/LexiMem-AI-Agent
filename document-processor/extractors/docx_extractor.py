import docx
import os

def extract_docx_content(file_path: str):
    """
    Extracts structured text, paragraphs, headings, and tables from DOCX documents.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    doc = docx.Document(file_path)
    
    paragraphs = []
    full_text_parts = []
    
    for i, p in enumerate(doc.paragraphs):
        text = p.text.strip()
        if text:
            is_heading = p.style.name.startswith("Heading") if p.style else False
            paragraphs.append({
                "index": i + 1,
                "text": text,
                "isHeading": is_heading,
                "style": p.style.name if p.style else "Normal"
            })
            full_text_parts.append(text)
            
    # Extract tables
    tables_data = []
    for t_idx, table in enumerate(doc.tables):
        table_rows = []
        for row in table.rows:
            row_cells = [cell.text.strip() for cell in row.cells]
            table_rows.append(row_cells)
        tables_data.append({
            "tableIndex": t_idx + 1,
            "rows": table_rows
        })
        
    full_text = "\n\n".join(full_text_parts)
    total_chars = len(full_text)
    
    return {
        "success": True,
        "isScanned": False,
        "ocrRequired": False,
        "statusMessage": "DOCX text and structure extraction successful.",
        "pageCount": max(1, round(total_chars / 2500)), # Estimate pages based on word count
        "totalCharacters": total_chars,
        "fullText": full_text,
        "paragraphs": paragraphs,
        "tables": tables_data,
        "metadata": {
            "title": doc.core_properties.title or "",
            "author": doc.core_properties.author or "",
            "created": str(doc.core_properties.created or ""),
            "paragraphCount": len(paragraphs),
            "tableCount": len(tables_data)
        }
    }
