package scms.business_service.repository.Sales;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms.business_service.entity.Sales.SalesOrder;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

  SalesOrder findBySoCode(String code);

  int countBySoCodeStartingWith(String prefix);

  SalesOrder findByPurchaseOrderPoId(Long poId);

  List<SalesOrder> findByCompanyId(Long companyId);

  List<SalesOrder> findByCompanyIdAndStatusAndLastUpdatedOnBetween(
      Long companyId, String status, LocalDateTime startDate, LocalDateTime endDate);
}
