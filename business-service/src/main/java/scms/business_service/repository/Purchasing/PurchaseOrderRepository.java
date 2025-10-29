package scms.business_service.repository.Purchasing;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms.business_service.entity.Purchasing.PurchaseOrder;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

  PurchaseOrder findByCode(String code);

  int countByCodeStartingWith(String prefix);

  List<PurchaseOrder> findByCompanyId(Long companyId);

  List<PurchaseOrder> findBySupplierCompanyId(Long supplierCompanyId);

  PurchaseOrder findByQuotationId(Long quotationId);

  List<PurchaseOrder> findByCompanyIdAndStatusAndLastUpdatedOnBetween(
      Long companyId, String status, LocalDateTime startDate, LocalDateTime endDate);
}
