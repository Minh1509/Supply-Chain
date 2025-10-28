package scms.business_service.repository.Sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms.business_service.entity.Sales.ProductOrigin;

@Repository
public interface ProductOriginRepository extends JpaRepository<ProductOrigin, Long> {
  // Custom queries if needed
}
