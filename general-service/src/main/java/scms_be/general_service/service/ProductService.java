package scms_be.general_service.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.dto.ProductDto;
import scms_be.general_service.model.entity.Item;
import scms_be.general_service.model.entity.Product;
import scms_be.general_service.model.request.ProductRequest;
import scms_be.general_service.repository.ItemRepository;
import scms_be.general_service.repository.ProductRepository;

@Service
public class ProductService {
    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ProductRepository productRepository;

    public ProductDto createProduct(ProductRequest request) {
        System.out.println("Creating product with request: " + request);
        Long itemId = request.getItemId();
        ProductRequest.ProductData productData = request.getProduct();

        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) {
            throw new RpcException(404, "Không tìm thấy Item!");
        }

        Product product = new Product();
        product.setItem(item);
        product.setSerialNumber(UUID.randomUUID().toString().substring(0, 8));

        Long batchNo = productData.getBatchNo();
        if (batchNo != null) {
            product.setBatchNo(batchNo);
        }

        product.setQrCode(productData.getQrCode());
        product.setCurrentCompanyId(1L); // Mock company ID

        product = productRepository.save(product);
        return convertToDto(product);
    }

    public List<ProductDto> getAllProductsByItem(ProductRequest request) {
        Long itemId = request.getItemId();
        List<Product> products = productRepository.findAll().stream()
            .filter(product -> product.getItem() != null && product.getItem().getItemId().equals(itemId))
            .collect(Collectors.toList());
        return products.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public ProductDto getProductById(ProductRequest request) {
        Long productId = request.getProductId();
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            throw new RpcException(404, "Không tìm thấy sản phẩm!");
        }
        return convertToDto(product);
    }

    public ProductDto updateProduct(ProductRequest request) {
        Long productId = request.getProductId();
        ProductRequest.ProductData productData = request.getProduct();
        Product existingProduct = productRepository.findById(productId).orElse(null);
        if (existingProduct == null) {
            throw new RpcException(404, "Không tìm thấy sản phẩm!");
        }
        if (productData.getBatchNo() != null) {
            existingProduct.setBatchNo(productData.getBatchNo());
        }
        if (productData.getQrCode() != null) {
            existingProduct.setQrCode(productData.getQrCode());
        }
        existingProduct = productRepository.save(existingProduct);
        return convertToDto(existingProduct);
    }

    public Map<String, Object> deleteProduct(ProductRequest request) {
        Long productId = request.getProductId();
        boolean exists = productRepository.existsById(productId);
        if (exists) {
            productRepository.deleteById(productId);
        }
        return Map.of(
            "success", exists,
            "message", exists ? "Xóa sản phẩm thành công!" : "Không tìm thấy sản phẩm!"
        );
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