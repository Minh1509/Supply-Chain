package scms_be.inventory_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.inventory_service.model.entity.Warehouse;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
  
  List<Warehouse> findByCompanyId(Long companyId);

  boolean existsByWarehouseCode(String warehouseCode);

  int countByWarehouseCodeStartingWith(String prefix);
  
}
