package scms_be.operation_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.operation_service.model.entity.DeliveryOrderDetail;

@Repository
public interface DeliveryOrderDetailRepository extends JpaRepository<DeliveryOrderDetail, Long> {

  List<DeliveryOrderDetail> findByDeliveryOrder_DoId(Long doId);

}

