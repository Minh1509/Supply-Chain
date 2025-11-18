package scms_be.operation_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.operation_service.model.entity.ManufactureStage;

@Repository
public interface ManufactureStageRepository extends JpaRepository<ManufactureStage, Long> {
  
  List<ManufactureStage> findByItemId(Long itemId);
  
  ManufactureStage findByItemIdAndStatus(Long itemId, String status);

  Integer countByStageCodeStartingWith(String prefix);
  
}
