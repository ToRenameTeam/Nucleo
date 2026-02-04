package it.nucleo.application

import it.nucleo.domain.Document
import it.nucleo.domain.prescription.Validity
import it.nucleo.domain.prescription.implementation.MedicinePrescription
import it.nucleo.domain.prescription.implementation.ServicePrescription
import it.nucleo.domain.report.Report
import it.nucleo.infrastructure.logging.logger
import java.io.ByteArrayOutputStream
import java.time.format.DateTimeFormatter
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.pdmodel.PDPage
import org.apache.pdfbox.pdmodel.PDPageContentStream
import org.apache.pdfbox.pdmodel.common.PDRectangle
import org.apache.pdfbox.pdmodel.font.PDType1Font
import org.apache.pdfbox.pdmodel.font.Standard14Fonts

/** Service responsible for generating PDF documents from domain documents. */
class DocumentPdfGenerator {

    private val logger = logger()
    private val dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy")

    companion object {
        private const val MARGIN = 50f
        private const val LINE_HEIGHT = 14f
        private const val TITLE_SIZE = 16f
        private const val HEADER_SIZE = 12f
        private const val BODY_SIZE = 10f
    }

    /**
     * Generates a PDF representation of the given document.
     *
     * @param document The document to convert to PDF
     * @return ByteArray containing the PDF content
     */
    fun generate(document: Document): ByteArray {
        logger.debug("Generating PDF for document: ${document.id.id}")

        return PDDocument().use { pdfDocument ->
            val page = PDPage(PDRectangle.A4)
            pdfDocument.addPage(page)

            PDPageContentStream(pdfDocument, page).use { content ->
                val writer = PdfContentWriter(content, page.mediaBox.height - MARGIN)

                when (document) {
                    is MedicinePrescription -> writeMedicinePrescription(writer, document)
                    is ServicePrescription -> writeServicePrescription(writer, document)
                    is Report -> writeReport(writer, document)
                    else -> writeGenericDocument(writer, document)
                }
            }

            val outputStream = ByteArrayOutputStream()
            pdfDocument.save(outputStream)
            logger.info("PDF generated successfully for document: ${document.id.id}")
            outputStream.toByteArray()
        }
    }

    private fun writeMedicinePrescription(
        writer: PdfContentWriter,
        prescription: MedicinePrescription
    ) {
        writer.writeTitle("MEDICINE PRESCRIPTION")
        writer.newLine()

        writeDocumentHeader(writer, prescription)
        writer.newLine()

        writer.writeHeader("Prescription Details")
        writer.writeField("Validity", formatValidity(prescription.validity))
        writer.newLine()

        writer.writeHeader("Dosage Information")
        writer.writeField("Medicine ID", prescription.dosage.medicine.id)
        writer.writeField(
            "Dose",
            "${prescription.dosage.dose.amount} ${prescription.dosage.dose.unit.symbol}"
        )
        writer.writeField(
            "Frequency",
            "${prescription.dosage.frequency.timesPerPeriod} times per ${prescription.dosage.frequency.period.name.lowercase()}"
        )
        writer.writeField(
            "Duration",
            "${prescription.dosage.duration.length} ${prescription.dosage.duration.unit.name.lowercase()}(s)"
        )

        writeFooter(writer, prescription)
    }

    private fun writeServicePrescription(
        writer: PdfContentWriter,
        prescription: ServicePrescription
    ) {
        writer.writeTitle("SERVICE PRESCRIPTION")
        writer.newLine()

        writeDocumentHeader(writer, prescription)
        writer.newLine()

        writer.writeHeader("Service Details")
        writer.writeField("Service ID", prescription.serviceId.id)
        writer.writeField("Facility ID", prescription.facilityId.id)
        writer.writeField("Priority", prescription.priority.name)
        writer.writeField("Validity", formatValidity(prescription.validity))

        writeFooter(writer, prescription)
    }

    private fun writeReport(writer: PdfContentWriter, report: Report) {
        writer.writeTitle("MEDICAL REPORT")
        writer.newLine()

        writeDocumentHeader(writer, report)
        writer.newLine()

        writer.writeHeader("Report Details")
        writer.writeField("Execution Date", report.executionDate.date.format(dateFormatter))
        writer.writeField("Related Prescription", report.servicePrescription.id.id)
        writer.newLine()

        report.clinicalQuestion?.let {
            writer.writeHeader("Clinical Question")
            writer.writeBody(it.text)
            writer.newLine()
        }

        writer.writeHeader("Findings")
        writer.writeBody(report.findings.text)
        writer.newLine()

        report.conclusion?.let {
            writer.writeHeader("Conclusion")
            writer.writeBody(it.text)
            writer.newLine()
        }

        report.recommendations?.let {
            writer.writeHeader("Recommendations")
            writer.writeBody(it.text)
        }

        writeFooter(writer, report)
    }

    private fun writeGenericDocument(writer: PdfContentWriter, document: Document) {
        writer.writeTitle("MEDICAL DOCUMENT")
        writer.newLine()

        writeDocumentHeader(writer, document)
        writer.newLine()

        writer.writeHeader("Summary")
        writer.writeBody(document.metadata.summary.summary)

        writeFooter(writer, document)
    }

    private fun writeDocumentHeader(writer: PdfContentWriter, document: Document) {
        writer.writeField("Document ID", document.id.id)
        writer.writeField("Patient ID", document.patientId.id)
        writer.writeField("Doctor ID", document.doctorId.id)
        writer.writeField("Issue Date", document.issueDate.date.format(dateFormatter))

        if (document.metadata.tags.isNotEmpty()) {
            writer.writeField("Tags", document.metadata.tags.joinToString(", ") { it.tag })
        }
    }

    private fun writeFooter(writer: PdfContentWriter, document: Document) {
        writer.newLine()
        writer.newLine()
        writer.writeBody("---")
        writer.writeBody("Generated automatically by Nucleo Healthcare System")
        writer.writeBody("Document ID: ${document.id.id}")
    }

    private fun formatValidity(validity: Validity): String {
        return when (validity) {
            is Validity.UntilDate -> "Valid until ${validity.date.format(dateFormatter)}"
            is Validity.UntilExecution -> "Valid until execution"
        }
    }

    /** Helper class to write content to a PDF page. */
    private class PdfContentWriter(
        private val content: PDPageContentStream,
        private var currentY: Float
    ) {
        private val boldFont = PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD)
        private val regularFont = PDType1Font(Standard14Fonts.FontName.HELVETICA)

        fun writeTitle(text: String) {
            content.beginText()
            content.setFont(boldFont, TITLE_SIZE)
            content.newLineAtOffset(MARGIN, currentY)
            content.showText(text)
            content.endText()
            currentY -= TITLE_SIZE + LINE_HEIGHT
        }

        fun writeHeader(text: String) {
            content.beginText()
            content.setFont(boldFont, HEADER_SIZE)
            content.newLineAtOffset(MARGIN, currentY)
            content.showText(text)
            content.endText()
            currentY -= HEADER_SIZE + 4
        }

        fun writeField(label: String, value: String) {
            content.beginText()
            content.setFont(boldFont, BODY_SIZE)
            content.newLineAtOffset(MARGIN, currentY)
            content.showText("$label: ")
            content.setFont(regularFont, BODY_SIZE)
            content.showText(value)
            content.endText()
            currentY -= LINE_HEIGHT
        }

        fun writeBody(text: String) {
            content.beginText()
            content.setFont(regularFont, BODY_SIZE)
            content.newLineAtOffset(MARGIN, currentY)
            content.showText(text)
            content.endText()
            currentY -= LINE_HEIGHT
        }

        fun newLine() {
            currentY -= LINE_HEIGHT
        }
    }
}
