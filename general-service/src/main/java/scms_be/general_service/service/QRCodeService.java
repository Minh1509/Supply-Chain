package scms_be.general_service.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class QRCodeService {

    public String generateQRCodeString(Long productId, String serialNumber) {
        return String.format("PRODUCT-%d-%s", productId, serialNumber);
    }

    public String generateQRCodeImage(String qrContent) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 300, 300, hints);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] imageBytes = outputStream.toByteArray();

            return Base64.getEncoder().encodeToString(imageBytes);
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code image", e);
        }
    }

    public Long parseProductIdFromQR(String qrCode) {
        try {
            String[] parts = qrCode.split(":");
            if (parts.length >= 2 && "PRODUCT".equals(parts[0])) {
                return Long.parseLong(parts[1]);
            }
            throw new IllegalArgumentException("Invalid QR code format");
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid QR code: " + qrCode);
        }
    }
}
