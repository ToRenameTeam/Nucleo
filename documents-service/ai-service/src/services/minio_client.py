"""
MinIO client for fetching PDF documents from object storage.
"""

import time
from io import BytesIO

from minio import Minio
from minio.error import S3Error

from src.config import Settings, get_settings
from src.utils.logger import get_logger

logger = get_logger(__name__)


class MinioClientError(Exception):
    """Base exception for MinIO client errors."""
    pass


class DocumentNotFoundError(MinioClientError):
    """Raised when a document is not found in MinIO."""
    pass


class MinioConnectionError(MinioClientError):
    """Raised when unable to connect to MinIO."""
    pass


class MinioClient:
    """
    Client for interacting with MinIO object storage.
    Handles document retrieval with retry logic and proper error handling.
    """

    def __init__(self, settings: Settings | None = None):
        """
        Initialize the MinIO client.

        Args:
            settings: Application settings. If None, loads from environment.
        """
        self._settings = settings or get_settings()
        self._client = self._create_client()

    def _create_client(self) -> Minio:
        logger.info(f"Connecting to MinIO at {self._settings.minio_endpoint}")

        return Minio(
            endpoint=self._settings.minio_endpoint,
            access_key=self._settings.minio_access_key,
            secret_key=self._settings.minio_secret_key,
            secure=self._settings.minio_secure,
        )

    def fetch_document(self, patient_id: str, document_id: str) -> bytes:
        """
        Fetch a PDF document from MinIO.

        The document is expected to be stored at:
        patients/{patient_id}/documents/{document_id}/{filename}.pdf

        Args:
            patient_id: The patient ID owning the document.
            document_id: The unique document identifier.

        Returns:
            The PDF document content as bytes.

        Raises:
            DocumentNotFoundError: If the document doesn't exist.
            MinioConnectionError: If unable to connect to MinIO.
            MinioClientError: For other MinIO-related errors.
        """
        prefix = f"patients/{patient_id}/documents/{document_id}/"
        logger.debug(f"Fetching document with prefix: {prefix}")

        for attempt in range(self._settings.max_retries):
            try:
                return self._fetch_with_prefix(prefix, document_id)
            except DocumentNotFoundError:
                raise
            except MinioConnectionError as e:
                if attempt < self._settings.max_retries - 1:
                    delay = self._settings.retry_delay_seconds * (2 ** attempt)
                    logger.warning(
                        f"MinIO connection failed, retrying in {delay}s "
                        f"(attempt {attempt + 1}/{self._settings.max_retries})"
                    )
                    time.sleep(delay)
                else:
                    raise e
            except Exception as e:
                logger.error(f"Unexpected error fetching document: {e}")
                raise MinioClientError(f"Failed to fetch document: {e}") from e

        raise MinioClientError("Maximum retries exceeded")

    def _fetch_with_prefix(self, prefix: str, document_id: str) -> bytes:
        try:
            # List objects to find the PDF file
            objects = list(self._client.list_objects(
                bucket_name=self._settings.minio_bucket_name,
                prefix=prefix,
            ))

            if not objects:
                logger.warning(f"Document not found: {document_id}")
                raise DocumentNotFoundError(f"Document not found: {document_id}")

            # Get the first (and should be only) object
            object_name = objects[0].object_name
            logger.debug(f"Found object: {object_name}")

            # Fetch the object content
            response = self._client.get_object(
                bucket_name=self._settings.minio_bucket_name,
                object_name=object_name,
            )

            try:
                content = response.read()
                logger.info(
                    f"Successfully fetched document {document_id} "
                    f"({len(content)} bytes)"
                )
                return content
            finally:
                response.close()
                response.release_conn()

        except S3Error as e:
            if e.code == "NoSuchKey" or e.code == "NoSuchBucket":
                raise DocumentNotFoundError(f"Document not found: {document_id}") from e
            elif "connect" in str(e).lower():
                raise MinioConnectionError(f"Failed to connect to MinIO: {e}") from e
            else:
                raise MinioClientError(f"MinIO error: {e}") from e
        except ConnectionError as e:
            raise MinioConnectionError(f"Failed to connect to MinIO: {e}") from e

    def health_check(self) -> bool:
        try:
            self._client.bucket_exists(self._settings.minio_bucket_name)
            return True
        except Exception as e:
            logger.warning(f"MinIO health check failed: {e}")
            return False
