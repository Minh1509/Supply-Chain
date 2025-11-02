package scms.business_service.repository.Sales;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms.business_service.entity.Sales.SalesOrderDetail;

@Repository
public interface SalesOrderDetailRepository extends JpaRepository<SalesOrderDetail, Long> {

  List<SalesOrderDetail> findBySalesOrderSoId(Long soId);
}
