"""
AI document analyzer using Groq API.
Generates summary and tags from medical document text.
"""

import json
import time
from dataclasses import dataclass

from groq import Groq
from groq import APIConnectionError, APIStatusError, RateLimitError

from src.config import Settings, get_settings
from src.utils.logger import get_logger

logger = get_logger(__name__)


class AiAnalysisError(Exception):
    """Base exception for AI analysis errors."""
    pass


class AiConnectionError(AiAnalysisError):
    """Raised when unable to connect to the AI service."""
    pass


class AiResponseParsingError(AiAnalysisError):
    """Raised when the AI response cannot be parsed."""
    pass


@dataclass
class DocumentMetadata:
    """
    AI-generated metadata for a medical document.

    Attributes:
        summary: A concise summary of the document (2-3 sentences).
        tags: A set of relevant medical tags/keywords.
    """
    summary: str
    tags: list[str]


SYSTEM_PROMPT = """You are a medical document analysis assistant specialized in healthcare documentation. Your task is to analyze documents and determine if they are medical-related.

You MUST respond with ONLY a valid JSON object, no markdown formatting, no explanations, no additional text. The response must be parseable by Python's json.loads() function.

IMPORTANT: First, determine if the document is medical-related. A document is considered medical if it contains:
- Medical diagnoses, conditions, or symptoms
- Prescriptions, medications, or treatments
- Medical procedures, tests, or examinations
- Clinical findings or health assessments
- Medical reports or healthcare provider documentation

If the document is NOT medical-related (e.g., invoice, contract, personal letter, receipt, general business document):
- Return EMPTY string for summary: ""
- Return EMPTY list for tags: []

If the document IS medical-related, analyze it and:
1. Generate a concise, professional summary (2-3 sentences) that captures:
   - The type of document (prescription, report)
   - Key medical information (diagnoses, medications, procedures, findings)
   - Patient-relevant outcomes or recommendations

2. Extract relevant tags (3-10 tags) including:
   - Document type (e.g., "prescription", "report")
   - Medical specialties involved (e.g., "cardiology", "radiology", "general_medicine")
   - Diagnoses or conditions mentioned
   - Medications prescribed (generic names preferred)
   - Procedures or tests performed
   - Key clinical findings
   - Anatomical regions involved
   - Urgency level if mentioned (e.g., "routine", "urgent")

Guidelines for tags:
- Use lowercase with underscores for multi-word tags (e.g., "blood_pressure")
- Use standardized medical terminology when possible
- Avoid patient-identifying information in tags
- Focus on clinically relevant terms

Response format for MEDICAL documents:
{"summary": "Your summary here.", "tags": ["tag1", "tag2", "tag3"]}

Response format for NON-MEDICAL documents:
{"summary": "", "tags": []}"""


USER_PROMPT_TEMPLATE = """Analyze the following medical document and provide a summary and tags.

DOCUMENT CONTENT:
{document_text}

Remember: Respond with ONLY a valid JSON object, no other text."""


class AiAnalyzer:
    """
    Analyzes medical documents using Groq AI to generate metadata.
    Uses the Groq API with configurable model and parameters.
    """

    def __init__(self, settings: Settings | None = None):
        """
        Initialize the AI analyzer.

        Args:
            settings: Application settings. If None, loads from environment.
        """
        self._settings = settings or get_settings()
        self._client = Groq(api_key=self._settings.groq_api_key)
        logger.info(f"AI Analyzer initialized with model: {self._settings.groq_model}")

    def analyze(self, document_text: str) -> DocumentMetadata:
        """
        Analyze a medical document and generate metadata.

        Args:
            document_text: The extracted text content of the document.

        Returns:
            DocumentMetadata containing summary and tags.

        Raises:
            AiConnectionError: If unable to connect to the AI service.
            AiAnalysisError: If the analysis fails.
            AiResponseParsingError: If the response cannot be parsed.
        """
        if not document_text or not document_text.strip():
            raise AiAnalysisError("Empty document text provided")

        logger.debug(f"Analyzing document with {len(document_text)} characters")

        # Truncate very long documents to avoid token limits
        max_chars = 15_000
        if len(document_text) > max_chars:
            logger.warning(
                f"Document text truncated from {len(document_text)} to {max_chars} characters"
            )
            document_text = document_text[:max_chars] + "\n\n[Document truncated due to length...]"

        for attempt in range(self._settings.max_retries):
            try:
                return self._call_ai(document_text)
            except AiConnectionError as e:
                if attempt < self._settings.max_retries - 1:
                    delay = self._settings.retry_delay_seconds * (2 ** attempt)
                    logger.warning(
                        f"AI connection failed, retrying in {delay}s "
                        f"(attempt {attempt + 1}/{self._settings.max_retries})"
                    )
                    time.sleep(delay)
                else:
                    raise e
            except RateLimitError as e:
                if attempt < self._settings.max_retries - 1:
                    delay = self._settings.retry_delay_seconds * (2 ** attempt) * 2
                    logger.warning(
                        f"Rate limit hit, retrying in {delay}s "
                        f"(attempt {attempt + 1}/{self._settings.max_retries})"
                    )
                    time.sleep(delay)
                else:
                    raise AiConnectionError(f"Rate limit exceeded: {e}") from e

        raise AiAnalysisError("Maximum retries exceeded")

    def _call_ai(self, document_text: str) -> DocumentMetadata:
        """
        Make the actual API call to Groq.

        Args:
            document_text: The document text to analyze.

        Returns:
            Parsed DocumentMetadata.
        """
        user_prompt = USER_PROMPT_TEMPLATE.format(document_text=document_text)

        try:
            logger.debug("Sending request to Groq API")

            response = self._client.chat.completions.create(
                model=self._settings.groq_model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=self._settings.groq_temperature,
                max_tokens=self._settings.groq_max_tokens,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            logger.debug(f"Received AI response: {content[:200]}...")

            return self._parse_response(content)

        except APIConnectionError as e:
            logger.error(f"Failed to connect to Groq API: {e}")
            raise AiConnectionError(f"Failed to connect to AI service: {e}") from e
        except APIStatusError as e:
            logger.error(f"Groq API error: {e}")
            raise AiAnalysisError(f"AI service error: {e}") from e
        except Exception as e:
            logger.error(f"Unexpected error during AI analysis: {e}")
            raise AiAnalysisError(f"AI analysis failed: {e}") from e

    def _parse_response(self, content: str) -> DocumentMetadata:
        """
        Parse the AI response JSON into DocumentMetadata.

        Args:
            content: The raw AI response content.

        Returns:
            Parsed DocumentMetadata. If document is not medical, returns empty summary and tags.

        Raises:
            AiResponseParsingError: If parsing fails.
        """
        if not content:
            raise AiResponseParsingError("Empty response from AI")

        try:
            # Clean potential markdown formatting
            content = content.strip()
            if content.startswith("```"):
                # Remove markdown code blocks
                lines = content.split("\n")
                content = "\n".join(
                    line for line in lines
                    if not line.startswith("```")
                )

            data = json.loads(content)

            # Validate required fields exist (even if empty)
            if "summary" not in data:
                raise AiResponseParsingError("Missing 'summary' field in AI response")
            if "tags" not in data:
                raise AiResponseParsingError("Missing 'tags' field in AI response")

            summary = str(data["summary"]).strip()
            tags = data["tags"]

            # Handle empty summary/tags (non-medical document)
            if not summary and not tags:
                logger.info("Document identified as non-medical (empty metadata)")
                return DocumentMetadata(summary="", tags=[])

            # Ensure tags is a list
            if isinstance(tags, str):
                tags = [tags] if tags else []
            elif not isinstance(tags, list):
                tags = list(tags) if tags else []

            # Clean and validate tags
            cleaned_tags = []
            for tag in tags:
                tag = str(tag).strip().lower().replace(" ", "_")
                if tag and len(tag) > 1:
                    cleaned_tags.append(tag)

            # Deduplicate while preserving order
            seen = set()
            unique_tags = []
            for tag in cleaned_tags:
                if tag not in seen:
                    seen.add(tag)
                    unique_tags.append(tag)

            logger.info(
                f"AI analysis complete: summary length={len(summary)}, "
                f"tags count={len(unique_tags)}"
            )

            return DocumentMetadata(summary=summary, tags=unique_tags)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {content[:500]}")
            raise AiResponseParsingError(
                f"Invalid JSON in AI response: {e}"
            ) from e
        except KeyError as e:
            logger.error(f"Missing required field in AI response: {e}")
            raise AiResponseParsingError(
                f"Missing field in AI response: {e}"
            ) from e

    def health_check(self) -> bool:
        """
        Check if the AI service is accessible.

        Returns:
            True if the service is healthy, False otherwise.
        """
        try:
            # Make a minimal API call to test connectivity
            self._client.models.list()
            return True
        except Exception as e:
            logger.warning(f"AI health check failed: {e}")
            return False
