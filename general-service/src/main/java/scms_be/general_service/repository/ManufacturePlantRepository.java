package scms_be.general_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import scms_be.general_service.model.entity.ManufacturePlant;

@Repository
public interface ManufacturePlantRepository extends JpaRepository<ManufacturePlant, Long> {
  
  List<ManufacturePlant> findByCompanyId(Long companyId);

  boolean existsByPlantCode(String plantCode);

  @Query("SELECT COUNT(p) FROM ManufacturePlant p WHERE p.plantCode LIKE :prefix%")
  int countByPlantCodeStartingWith(@Param("prefix") String prefix);
  
}
