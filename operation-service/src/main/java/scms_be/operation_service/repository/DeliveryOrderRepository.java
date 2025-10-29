package scms_be.operation_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import scms_be.operation_service.model.entity.DeliveryOrder;

public interface DeliveryOrderRepository extends JpaRepository<DeliveryOrder, Long> {

  int countByDoCodeStartingWith(String prefix);

  DeliveryOrder findBySalesOrderId(Long soId);

}
