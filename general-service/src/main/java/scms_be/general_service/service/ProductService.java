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

  public ProductDto createProduct(Long itemId, ProductData newProduct) {
    Item item = itemRepository.findById(itemId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy hàng hóa!"));

    Product product = new Product();

    product.setItem(item);
    product.setSerialNumber(UUID.randomUUID().toString().substring(0, 8));
    product.setBatchNo(newProduct.getBatchNo());
    product.setQrCode(newProduct.getQrCode());
    return convertToDto(productRepository.save(product));
  }

  public List<ProductDto> getAllProductsByItem(Long itemId) {
    List<Product> products = productRepository.findByItemItemId(itemId);
    return products.stream().map(this::convertToDto).collect(Collectors.toList());
  }

  public ProductDto getProductById(Long productId) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy hàng hóa!"));
    return convertToDto(product);
  }

  public ProductDto updateProduct(Long productId, ProductData updated) {
    Product existing = productRepository.findById(productId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy hàng hóa!"));

    existing.setBatchNo(updated.getBatchNo());
    existing.setQrCode(updated.getQrCode());
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