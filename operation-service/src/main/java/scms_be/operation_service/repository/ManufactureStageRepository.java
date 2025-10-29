package scms_be.operation_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.operation_service.model.entity.ManufactureStage;

@Repository
public interface ManufactureStageRepository extends JpaRepository<ManufactureStage, Long> {
  
  ManufactureStage findByItemId(Long itemId);

  Integer countByStageCodeStartingWith(String prefix);
  
}
