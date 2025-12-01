package scms_be.general_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.general_service.model.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
  
  List<Product> findByItemItemId(Long itemId);
  
  Optional<Product> findByQrCode(String qrCode);
  
  List<Product> findByCurrentCompanyId(Long companyId);
  
  List<Product> findByBatchNo(String batchNo);
}
