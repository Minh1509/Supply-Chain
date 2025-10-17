package scms_be.inventory_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.inventory_service.model.entity.Inventory;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

  List<Inventory> findAllByItemId(long itemId);

  List<Inventory> findAllByWarehouse_WarehouseId(long warehouseId);

  Inventory findByItemIdAndWarehouse_WarehouseId(Long itemId, Long warehouseId);

  List<Inventory> findAllByItemIdAndWarehouse_WarehouseId(long itemId, long warehouseId);

  List<Inventory> findByItemId(Long itemId);

  boolean existsByItemIdAndWarehouse_WarehouseId(Long itemId, Long warehouseId);


}
