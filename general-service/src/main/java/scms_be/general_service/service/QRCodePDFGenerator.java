package scms_be.general_service.service;

import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import scms_be.general_service.model.entity.Product;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.List;

@Service
public class QRCodePDFGenerator {

    @Autowired
    private QRCodeService qrCodeService;

    public byte[] generateBatchQRCodesPDF(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return new byte[0];
        }

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(20, 20, 20, 20);

            // Table with 4 columns
            Table table = new Table(UnitValue.createPercentArray(4)).useAllAvailableWidth();

            for (Product product : products) {
                // Generate QR Image (Base64)
                String qrBase64 = qrCodeService.generateQRCodeImage(product.getQrCode());
                byte[] imageBytes = Base64.getDecoder().decode(qrBase64);

                ImageData imageData = ImageDataFactory.create(imageBytes);
                Image qrImage = new Image(imageData);
                qrImage.setAutoScale(true);
                qrImage.setWidth(100);
                qrImage.setHeight(100);
                qrImage.setHorizontalAlignment(HorizontalAlignment.CENTER);

                Cell cell = new Cell();
                cell.add(qrImage);
                
                Paragraph serialText = new Paragraph(product.getSerialNumber())
                        .setFontSize(8)
                        .setTextAlignment(TextAlignment.CENTER);
                cell.add(serialText);
                
                if (product.getItem() != null) {
                    Paragraph nameText = new Paragraph(product.getItem().getItemName())
                            .setFontSize(7)
                            .setTextAlignment(TextAlignment.CENTER);
                    cell.add(nameText);
                }

                cell.setPadding(10);
                table.addCell(cell);
            }

            document.add(table);
            document.close();

            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}
