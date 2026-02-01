from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel
from src.config import get_settings
from src.services import (
    AiAnalyzer,
    AiAnalysisError,
    AiConnectionError,
    AiResponseParsingError,
    MinioClient,
    MinioClientError,
    MinioConnectionError,
    DocumentNotFoundError,
    PdfExtractor,
    PdfExtractionError,
    EmptyPdfError,
    CorruptedPdfError,
)
from src.utils.logger import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)

minio_client: MinioClient | None = None
pdf_extractor: PdfExtractor | None = None
ai_analyzer: AiAnalyzer | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global minio_client, pdf_extractor, ai_analyzer

    logger.info("=" * 60)
    logger.info("Starting AI Service for Medical Document Analysis")
    logger.info("=" * 60)

    try:
        settings = get_settings()
        logger.info("Configuration loaded:")
        logger.info(f"  - HTTP Port: {settings.http_port}")
        logger.info(f"  - MinIO Endpoint: {settings.minio_endpoint}")
        logger.info(f"  - MinIO Bucket: {settings.minio_bucket_name}")
        logger.info(f"  - AI Model: {settings.groq_model}")
        logger.info(f"  - Log Level: {settings.log_level}")
    except Exception as e:
        logger.error(f"Failed to load configuration: {e}")
        raise

    logger.info("Initializing services...")
    minio_client = MinioClient()
    pdf_extractor = PdfExtractor()
    ai_analyzer = AiAnalyzer()

    logger.info("AI Service ready!")

    yield

    logger.info("Shutting down AI Service...")


app = FastAPI(
    title="AI Document Analysis Service",
    description="Analyzes medical documents and generates AI-powered metadata",
    version="1.0.0",
    lifespan=lifespan,
)

class AnalyzeRequest(BaseModel):
    """Request model for document analysis."""
    document_id: str
    patient_id: str


class AnalyzeResponse(BaseModel):
    """Response model for document analysis."""
    success: bool
    summary: str = ""
    tags: list[str] = []
    error_code: str | None = None
    error_message: str | None = None


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    service: str


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", service="ai-service")


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_document(request: AnalyzeRequest):
    """
    Analyze a medical document and generate AI metadata.

    - Fetches the PDF from MinIO using document_id and patient_id
    - Extracts text from the PDF
    - Uses Groq AI to generate summary and tags
    """
    document_id = request.document_id
    patient_id = request.patient_id

    logger.info(f"Analyzing document: {document_id} for patient: {patient_id}")

    try:
        logger.debug(f"Fetching document {document_id} from MinIO")
        pdf_content = minio_client.fetch_document(patient_id, document_id)

        logger.debug(f"Extracting text from document {document_id}")
        document_text = pdf_extractor.extract_text(pdf_content)

        logger.debug(f"Analyzing document {document_id} with AI")
        metadata = ai_analyzer.analyze(document_text)

        logger.info(
            f"Successfully analyzed document {document_id}: "
            f"summary_length={len(metadata.summary)}, tags_count={len(metadata.tags)}"
        )

        return AnalyzeResponse(
            success=True,
            summary=metadata.summary,
            tags=metadata.tags,
        )

    except DocumentNotFoundError:
        logger.warning(f"Document not found: {document_id}")
        return AnalyzeResponse(
            success=False,
            error_code="DOCUMENT_NOT_FOUND",
            error_message=f"Document not found: {document_id}",
        )

    except MinioConnectionError as e:
        logger.error(f"MinIO connection error: {e}")
        return AnalyzeResponse(
            success=False,
            error_code="MINIO_CONNECTION_FAILED",
            error_message="Failed to connect to document storage",
        )

    except MinioClientError as e:
        logger.error(f"MinIO client error: {e}")
        return AnalyzeResponse(
            success=False,
            error_code="MINIO_CONNECTION_FAILED",
            error_message=f"Document storage error: {e}",
        )

    except (EmptyPdfError, CorruptedPdfError) as e:
        logger.warning(f"PDF extraction failed for {document_id}: {e}")
        return AnalyzeResponse(
            success=False,
            error_code="PDF_EXTRACTION_FAILED",
            error_message=f"Failed to extract text from PDF: {e}",
        )

    except PdfExtractionError as e:
        logger.error(f"PDF extraction error for {document_id}: {e}")
        return AnalyzeResponse(
            success=False,
            error_code="PDF_EXTRACTION_FAILED",
            error_message=f"PDF processing error: {e}",
        )

    except (AiConnectionError, AiResponseParsingError) as e:
        logger.error(f"AI analysis failed for {document_id}: {e}")
        return AnalyzeResponse(
            success=False,
            error_code="AI_GENERATION_FAILED",
            error_message=f"AI analysis failed: {e}",
        )

    except AiAnalysisError as e:
        logger.error(f"AI analysis error for {document_id}: {e}")
        return AnalyzeResponse(
            success=False,
            error_code="AI_GENERATION_FAILED",
            error_message=f"AI processing error: {e}",
        )

    except Exception as e:
        logger.exception(f"Unexpected error analyzing document {document_id}")
        return AnalyzeResponse(
            success=False,
            error_code="INTERNAL_ERROR",
            error_message=f"Internal error: {e}",
        )


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=settings.http_port,
        reload=False,
    )
