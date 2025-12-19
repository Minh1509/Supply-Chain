package scms.business_service.service.Sales;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import scms.business_service.entity.Sales.SalesOrder;
import scms.business_service.entity.Sales.SalesOrderDetail;
import scms.business_service.exception.RpcException;
import scms.business_service.repository.Sales.SalesOrderDetailRepository;

@Service
public class InvoicePdfGenerator {

  @Autowired
  private SalesOrderDetailRepository salesOrderDetailRepository;

  @Autowired
  private scms.business_service.event.publisher.ExternalServicePublisher externalServicePublisher;

  private static void addCell(PdfPTable table, String text, Font font, int align) {
    PdfPCell cell = new PdfPCell(new Phrase(text, font));
    cell.setHorizontalAlignment(align);
    cell.setPadding(5);
    table.addCell(cell);
  }

  private static Paragraph createLabelValueParagraph(String label, String value, Font labelFont, Font valueFont) {
    Paragraph p = new Paragraph();
    p.add(new Chunk(label, labelFont));
    p.add(new Chunk(value, valueFont));
    return p;
  }

  private static void addSummaryRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
    PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
    labelCell.setColspan(5);
    labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
    labelCell.setPadding(5);
    table.addCell(labelCell);

    PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
    valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
    valueCell.setPadding(5);
    table.addCell(valueCell);
  }

  public byte[] generateInvoicePdf(SalesOrder salesOrder) {
    try {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      Document document = new Document();
      PdfWriter.getInstance(document, baos);
      document.open();

      BaseFont baseFont = BaseFont.createFont("fonts/Roboto.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
      Font labelFont = new Font(baseFont, 10, Font.BOLD);
      Font valueFont = new Font(baseFont, 10);

      // Fetch Company Info
      var seller = externalServicePublisher.getCompanyById(salesOrder.getCompanyId());
      var buyer = externalServicePublisher.getCompanyById(salesOrder.getCustomerCompanyId());
      
      String sellerName = seller != null ? seller.getCompanyName() : "ID: " + salesOrder.getCompanyId();
      String sellerAddress = seller != null ? seller.getAddress() : "Địa chỉ: N/A";
      String buyerName = buyer != null ? buyer.getCompanyName() : "ID: " + salesOrder.getCustomerCompanyId();

      // Title
      Paragraph companyTitle = new Paragraph("CÔNG TY CUNG CẤP: " + sellerName.toUpperCase(), new Font(baseFont, 12, Font.BOLD));
      companyTitle.setAlignment(Element.ALIGN_CENTER);
      document.add(companyTitle);

      Paragraph companyInfo = new Paragraph("Địa chỉ công ty: " + sellerAddress, new Font(baseFont, 10, Font.ITALIC));
      companyInfo.setAlignment(Element.ALIGN_CENTER);
      companyInfo.setSpacingAfter(10);
      document.add(companyInfo);

      Paragraph invoiceTitle = new Paragraph("HÓA ĐƠN BÁN HÀNG", new Font(baseFont, 14, Font.BOLD));
      invoiceTitle.setAlignment(Element.ALIGN_CENTER);
      invoiceTitle.setSpacingAfter(15);
      document.add(invoiceTitle);
      
      document.add(createLabelValueParagraph("Mã đơn hàng: ", salesOrder.getSoCode(), labelFont, valueFont));
      document.add(createLabelValueParagraph("Công ty bán: ", sellerName, labelFont, valueFont));
      document.add(createLabelValueParagraph("Công ty mua: ", buyerName, labelFont, valueFont));
      document.add(createLabelValueParagraph("Phương thức thanh toán: ", 
          salesOrder.getPaymentMethod() != null ? salesOrder.getPaymentMethod() : "Chưa xác định", labelFont, valueFont));

      PdfPTable table = new PdfPTable(6);
      table.setWidthPercentage(100);
      table.setSpacingBefore(10);

      String[] headers = { "STT", "Mã hàng", "Số lượng", "Đơn giá", "Chiết khấu", "Thành tiền" };
      for (String header : headers) {
        PdfPCell cell = new PdfPCell(new Phrase(header, labelFont));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        table.addCell(cell);
      }

      var details = salesOrderDetailRepository.findBySalesOrderSoId(salesOrder.getSoId());
      double subTotal = 0.0;
      
      int stt = 1;
      for (SalesOrderDetail detail : details) {
        addCell(table, String.valueOf(stt++), valueFont, Element.ALIGN_CENTER);
        
        var item = externalServicePublisher.getItemById(detail.getItemId());
        String itemCode = item != null ? item.getItemCode() : "";
        
        addCell(table, itemCode, valueFont, Element.ALIGN_LEFT);
        addCell(table, String.valueOf(detail.getQuantity()), valueFont, Element.ALIGN_RIGHT);
        addCell(table, String.format("%,.2f", detail.getItemPrice()), valueFont, Element.ALIGN_RIGHT);
        addCell(table, String.format("%,.2f", detail.getDiscount() != null ? detail.getDiscount() : 0.0), valueFont, Element.ALIGN_RIGHT);
        double lineTotal = (detail.getQuantity() * detail.getItemPrice()) - (detail.getDiscount() != null ? detail.getDiscount() : 0.0);
        subTotal += lineTotal;
        addCell(table, String.format("%,.2f", lineTotal), valueFont, Element.ALIGN_RIGHT);
      }

      // Get quotation data from purchase order
      double taxRate = salesOrder.getPurchaseOrder().getQuotation().getTaxRate() != null 
          ? salesOrder.getPurchaseOrder().getQuotation().getTaxRate() : 0.0;
      double taxAmount = subTotal * taxRate / 100;
      double totalAmount = subTotal + taxAmount;

      addSummaryRow(table, "Tổng cộng", String.format("%,.2f", subTotal), labelFont, valueFont);
      addSummaryRow(table, "Thuế (%)", String.format("%.1f", taxRate), labelFont, valueFont);
      addSummaryRow(table, "Tiền thuế", String.format("%,.2f", taxAmount), labelFont, valueFont);
      addSummaryRow(table, "Tổng tiền thanh toán", String.format("%,.2f", totalAmount), labelFont, valueFont);

      document.add(table);

      DateTimeFormatter formatter = DateTimeFormatter.ofPattern("'Ngày' dd 'tháng' MM 'năm' yyyy",
          Locale.forLanguageTag("vi-VN"));
      String formattedDate = "Hà Nội, " + LocalDate.now().format(formatter);

      Paragraph dateParagraph = new Paragraph(formattedDate, new Font(baseFont, 9, Font.ITALIC));
      dateParagraph.setAlignment(Element.ALIGN_RIGHT);
      dateParagraph.setSpacingBefore(5);
      dateParagraph.setSpacingAfter(5);
      document.add(dateParagraph);

      PdfPTable signTable = new PdfPTable(2);
      signTable.setWidthPercentage(100);

      Font signFont = new Font(baseFont, 12, Font.BOLD);

      PdfPCell leftCell = new PdfPCell();
      leftCell.addElement(new Paragraph("BÊN MUA", signFont));
      leftCell.addElement(new Paragraph("(Ký, ghi rõ họ tên)", new Font(baseFont, 10, Font.ITALIC)));
      leftCell.setHorizontalAlignment(Element.ALIGN_CENTER);
      leftCell.setBorder(Rectangle.NO_BORDER);
      for (Element e : leftCell.getCompositeElements()) {
          ((Paragraph) e).setAlignment(Element.ALIGN_CENTER);
      }
      signTable.addCell(leftCell);

      PdfPCell rightCell = new PdfPCell();
      rightCell.addElement(new Paragraph("BÊN BÁN", signFont));
      rightCell.addElement(new Paragraph("(Ký, ghi rõ họ tên)", new Font(baseFont, 10, Font.ITALIC)));
      rightCell.setHorizontalAlignment(Element.ALIGN_CENTER);
      rightCell.setBorder(Rectangle.NO_BORDER);
      for (Element e : rightCell.getCompositeElements()) {
          ((Paragraph) e).setAlignment(Element.ALIGN_CENTER);
      }
      signTable.addCell(rightCell);

      document.add(signTable);

      document.close();

      return baos.toByteArray();
    } catch (Exception e) {
      throw new RpcException(500, "Lỗi khi tạo file PDF: " + e.getMessage());
    }
  }
}
