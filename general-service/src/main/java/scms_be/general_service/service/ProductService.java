package scms_be.general_service.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.dto.ProductDto;
import scms_be.general_service.model.dto.ProductDetailDto;
import scms_be.general_service.model.entity.Item;
import scms_be.general_service.model.entity.Product;
import scms_be.general_service.repository.ItemRepository;
import scms_be.general_service.repository.ProductRepository;

@Service
public class ProductService {
   
  @Autowired
  private ProductRepository productRepository;

  @Autowired
  private ItemRepository itemRepository;

  @Autowired
  private QRCodePDFGenerator qrCodePDFGenerator;

  public ProductDto getProductById(Long productId) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy sản phẩm!"));
    return convertToDto(product);
  }

  public List<ProductDto> batchCreateProducts(Long itemId, Integer quantity, String batchNo, Long moId) {
    Item item = itemRepository.findById(itemId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy hàng hóa!"));

    List<Product> products = new java.util.ArrayList<>();
    for (int i = 0; i < quantity; i++) {
        Product product = new Product();
        product.setItem(item);
        product.setBatchNo(batchNo);
        product.setStatus("PRODUCED");
        product.setSerialNumber(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        
        product = productRepository.save(product);
        
        String qrCode = "PRODUCT-" + product.getProductId() + "-" + product.getSerialNumber();
        product.setQrCode(qrCode);
        
        products.add(product);
    }
    
    return productRepository.saveAll(products).stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public List<ProductDto> getProductsByBatchNo(String batchNo) {
    List<Product> products = productRepository.findByBatchNo(batchNo);
    return products.stream().map(this::convertToDto).collect(Collectors.toList());
  }

  public List<ProductDto> getProductsByCompanyId(Long companyId) {
    List<Product> products = productRepository.findByCurrentCompanyId(companyId);
    return products.stream().map(this::convertToDto).collect(Collectors.toList());
  }

  public String generateBatchQRCodesPDF(String batchNo) {
    List<Product> products = productRepository.findByBatchNo(batchNo);
    if (products.isEmpty()) {
        throw new RpcException(404, "Không tìm thấy sản phẩm nào trong batch này!");
    }
    
    byte[] pdfBytes = qrCodePDFGenerator.generateBatchQRCodesPDF(products);
    return java.util.Base64.getEncoder().encodeToString(pdfBytes);
  }

  public ProductDetailDto scanQRCodeDetail(String qrCode) {
    Product product = productRepository.findByQrCode(qrCode)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy sản phẩm với QR code này!"));
    
    ProductDetailDto dto = new ProductDetailDto();
    dto.setProductId(product.getProductId());
    dto.setItemId(product.getItem().getItemId());
    dto.setItemCode(product.getItem().getItemCode());
    dto.setItemName(product.getItem().getItemName());
    dto.setTechnicalSpecifications(product.getItem().getTechnicalSpecifications());
    dto.setDescription(product.getItem().getDescription());
    dto.setImageUrl(product.getItem().getImageUrl());
    dto.setCurrentCompanyId(product.getCurrentCompanyId());
    dto.setSerialNumber(product.getSerialNumber());
    dto.setBatchNo(product.getBatchNo());
    dto.setQrCode(product.getQrCode());
    dto.setStatus(product.getStatus());
    
    return dto;
  }

  public void updateBatchStatus(String batchNo, String newStatus) {
    List<Product> products = productRepository.findByBatchNo(batchNo);
    if (!products.isEmpty()) {
        for (Product product : products) {
            product.setStatus(newStatus);
        }
        productRepository.saveAll(products);
    }
  }

  private ProductDto convertToDto(Product product) {
    ProductDto dto = new ProductDto();
    dto.setProductId(product.getProductId());
    dto.setItemId(product.getItem().getItemId());
    dto.setItemName(product.getItem().getItemName());
    dto.setTechnicalSpecifications(product.getItem().getTechnicalSpecifications());
    dto.setSerialNumber(product.getSerialNumber());
    dto.setBatchNo(product.getBatchNo());
    dto.setQrCode(product.getQrCode());
    dto.setCurrentCompanyId(product.getCurrentCompanyId());
    dto.setStatus(product.getStatus());
    return dto;
  }
}