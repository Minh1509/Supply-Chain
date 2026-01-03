package scms_be.operation_service.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.operation_service.model.entity.ManufactureOrder;

@Repository
public interface ManufactureOrderRepository extends JpaRepository<ManufactureOrder, Long> {

  List<ManufactureOrder> findByItemId(Long itemId);

  ManufactureOrder findByMoCode(String moCode);

  int countByItemIdAndLineId(Long itemId, Long lineId);

  ManufactureOrder findByMoId(Long referenceId);

  ManufactureOrder findByItemIdAndStatusAndLastUpdatedOnBetween(Long itemId, String status, LocalDateTime start, LocalDateTime end);

  List<ManufactureOrder> findAllByItemIdAndStatusAndLastUpdatedOnBetween(Long itemId, String status, LocalDateTime start, LocalDateTime end);

  ManufactureOrder findByItemIdAndStatusAndEstimatedStartTimeBetween(Long itemId, String status, LocalDateTime start, LocalDateTime end);

  List<ManufactureOrder> findAllByItemIdAndStatusAndEstimatedStartTimeBetween(Long itemId, String status, LocalDateTime start, LocalDateTime end);
}
