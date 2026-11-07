from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import tempfile
import os

from extractors.pdf_extractor import extract_pdf_content
from extractors.docx_extractor import extract_docx_content

app = FastAPI(
    title="LexiMem Document Processing Engine",
    description="High-precision PDF & DOCX text and structure extraction with scanned document detection.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PathExtractionRequest(BaseModel):
    file_path: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LexiMem Document Processor",
        "supportedFormats": ["pdf", "docx"],
        "ocrDetection": "enabled"
    }

@app.post("/extract")
async def extract_uploaded_file(file: UploadFile = File(...)):
    filename = file.filename or ""
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    
    if ext not in ["pdf", "docx"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Only PDF and DOCX documents are accepted.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        if ext == "pdf":
            result = extract_pdf_content(tmp_path)
        else:
            result = extract_docx_content(tmp_path)
            
        result["filename"] = filename
        result["extension"] = ext
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document extraction error: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/extract-path")
def extract_by_path(req: PathExtractionRequest):
    file_path = req.file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File path does not exist.")
        
    ext = file_path.split(".")[-1].lower() if "." in file_path else ""
    if ext not in ["pdf", "docx"]:
        raise HTTPException(status_code=400, detail="Unsupported file format.")
        
    try:
        if ext == "pdf":
            result = extract_pdf_content(file_path)
        else:
            result = extract_docx_content(file_path)
            
        result["filename"] = os.path.basename(file_path)
        result["extension"] = ext
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
