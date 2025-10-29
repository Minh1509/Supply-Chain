package scms_be.operation_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.operation_service.model.entity.BOM;

@Repository
public interface BOMRepository extends JpaRepository<BOM, Long> {
  
  boolean existsByBomCode(String bomCode);

  BOM findByItemId(Long itemId);

  int countByBomCodeStartingWith(String prefix);

  boolean existsByItemId(Long itemId);
}
