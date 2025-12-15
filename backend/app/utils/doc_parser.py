# app/utils/doc_parser.py
from pypdf import PdfReader
from io import BytesIO

async def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts raw text from a PDF file in memory.
    """
    try:
        pdf_file = BytesIO(file_bytes)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"