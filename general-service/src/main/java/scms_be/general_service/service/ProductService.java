package scms_be.general_service.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.dto.ProductDto;
import scms_be.general_service.model.entity.Item;
import scms_be.general_service.model.entity.Product;
import scms_be.general_service.model.request.ProductRequest.ProductData;
import scms_be.general_service.repository.ItemRepository;
import scms_be.general_service.repository.ProductRepository;

@Service
public class ProductService {
   
  @Autowired
  private ProductRepository productRepository;

  @Autowired
  private ItemRepository itemRepository;

  @Autowired
  private QRCodeService qrCodeService;

  public ProductDto createProduct(Long itemId, ProductData newProduct) {
    Item item = itemRepository.findById(itemId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy hàng hóa!"));

    Product product = new Product();
    product.setItem(item);
    product.setSerialNumber(UUID.randomUUID().toString().substring(0, 8));
    product.setBatchNo(newProduct.getBatchNo());
    
    Product savedProduct = productRepository.save(product);
    
    String qrCodeString = qrCodeService.generateQRCodeString(
        savedProduct.getProductId(), 
        savedProduct.getSerialNumber()
    );
    savedProduct.setQrCode(qrCodeString);
    
    return convertToDto(productRepository.save(savedProduct));
  }

  public List<ProductDto> getAllProductsByItem(Long itemId) {
    List<Product> products = productRepository.findByItemItemId(itemId);
    return products.stream().map(this::convertToDto).collect(Collectors.toList());
  }

  public ProductDto getProductById(Long productId) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy sản phẩm!"));
    return convertToDto(product);
  }

  public ProductDto updateProduct(Long productId, ProductData updated) {
    Product existing = productRepository.findById(productId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy sản phẩm!"));

    existing.setBatchNo(updated.getBatchNo());
    return convertToDto(productRepository.save(existing));
  }

  public boolean deleteProduct(Long productId) {
    Optional<Product> product = productRepository.findById(productId);
    if (product.isPresent()) {
      productRepository.delete(product.get());
      return true;
    }
    return false;
  }

  public ProductDto getProductByQrCode(String qrCode) {
    Product product = productRepository.findByQrCode(qrCode)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy sản phẩm với QR code này!"));
    return convertToDto(product);
  }

  public List<ProductDto> getAllProductsByCompany(Long companyId) {
    List<Product> products = productRepository.findByCurrentCompanyId(companyId);
    return products.stream().map(this::convertToDto).collect(Collectors.toList());
  }

  public List<ProductDto> getProductsByBatchNo(Long batchNo) {
    List<Product> products = productRepository.findByBatchNo(batchNo);
    return products.stream().map(this::convertToDto).collect(Collectors.toList());
  }

  public ProductDto transferProduct(Long productId, Long newCompanyId) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy sản phẩm!"));
    
    product.setCurrentCompanyId(newCompanyId);
    return convertToDto(productRepository.save(product));
  }

  public String getQRCodeImage(Long productId) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy sản phẩm!"));
    
    if (product.getQrCode() == null || product.getQrCode().isEmpty()) {
      throw new RpcException(400, "Sản phẩm chưa có QR code!");
    }
    
    return qrCodeService.generateQRCodeImage(product.getQrCode());
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
    return dto;
  }
}