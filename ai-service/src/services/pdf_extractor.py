"""
PDF text extraction using PyMuPDF.
"""

from io import BytesIO

import pymupdf

from src.utils.logger import get_logger

logger = get_logger(__name__)


class PdfExtractionError(Exception):
    """Base exception for PDF extraction errors."""
    pass


class EmptyPdfError(PdfExtractionError):
    """Raised when the PDF contains no extractable text."""
    pass


class CorruptedPdfError(PdfExtractionError):
    """Raised when the PDF is corrupted or unreadable."""
    pass


class PdfExtractor:
    """
    Extracts text content from PDF documents using PyMuPDF.
    Handles various edge cases like empty or corrupted PDFs.
    """

    # Minimum text length to consider extraction successful
    MIN_TEXT_LENGTH = 10

    def extract_text(self, pdf_content: bytes) -> str:
        """
        Extract text from a PDF document.

        Args:
            pdf_content: The PDF file content as bytes.

        Returns:
            Extracted text content preserving basic structure.

        Raises:
            CorruptedPdfError: If the PDF is corrupted or cannot be read.
            EmptyPdfError: If no text could be extracted from the PDF.
            PdfExtractionError: For other extraction failures.
        """
        if not pdf_content:
            raise CorruptedPdfError("Empty PDF content provided")

        logger.debug(f"Extracting text from PDF ({len(pdf_content)} bytes)")

        try:
            return self._extract_with_pymupdf(pdf_content)
        except (EmptyPdfError, CorruptedPdfError):
            raise
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise PdfExtractionError(f"Failed to extract text from PDF: {e}") from e

    def _extract_with_pymupdf(self, pdf_content: bytes) -> str:
        """
        Extract text using PyMuPDF library.

        Args:
            pdf_content: PDF bytes.

        Returns:
            Extracted text.
        """
        try:
            doc = pymupdf.open(stream=pdf_content, filetype="pdf")
        except Exception as e:
            raise CorruptedPdfError(f"Failed to open PDF: {e}") from e

        try:
            if doc.page_count == 0:
                raise EmptyPdfError("PDF has no pages")

            text_parts = []

            for page_num in range(doc.page_count):
                page = doc[page_num]

                # Extract text with layout preservation
                page_text = page.get_text("text")

                if page_text.strip():
                    text_parts.append(f"--- Page {page_num + 1} ---")
                    text_parts.append(page_text.strip())

            full_text = "\n\n".join(text_parts)

            # Clean up the text
            full_text = self._clean_text(full_text)

            if len(full_text.strip()) < self.MIN_TEXT_LENGTH:
                raise EmptyPdfError(
                    "PDF contains no extractable text or only minimal content"
                )

            logger.info(
                f"Successfully extracted {len(full_text)} characters "
                f"from {doc.page_count} page(s)"
            )

            return full_text

        finally:
            doc.close()

    def _clean_text(self, text: str) -> str:
        """
        Clean extracted text by removing excessive whitespace.

        Args:
            text: Raw extracted text.

        Returns:
            Cleaned text.
        """
        # Replace multiple newlines with double newlines
        import re
        text = re.sub(r'\n{3,}', '\n\n', text)

        # Replace multiple spaces with single space
        text = re.sub(r' {2,}', ' ', text)

        # Strip leading/trailing whitespace from each line
        lines = [line.strip() for line in text.split('\n')]
        text = '\n'.join(lines)

        return text.strip()
