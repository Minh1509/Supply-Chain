package scms.business_service.repository.Purchasing;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms.business_service.entity.Purchasing.PurchaseOrderDetail;

@Repository
public interface PurchaseOrderDetailRepository extends JpaRepository<PurchaseOrderDetail, Long> {

  List<PurchaseOrderDetail> findByPoPoId(Long poId);
}
