package scms_be.general_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.general_service.model.entity.ManufactureLine;

@Repository
public interface ManufactureLineRepository extends JpaRepository<ManufactureLine, Long> {
  
  List<ManufactureLine> findByPlantPlantId(Long plantId);

  boolean existsByLineCode(String lineCode);

  Integer countByLineCodeStartingWith(String lineCodePrefix);
  
}
