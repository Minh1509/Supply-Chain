package scms_be.operation_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import scms_be.operation_service.model.entity.DeliveryProcess;

public interface DeliveryProcessRepository extends JpaRepository<DeliveryProcess, Long> {

  List<DeliveryProcess> findByDeliveryOrder_DoId(Long doId);
  
}
