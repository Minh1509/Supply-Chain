package scms_be.inventory_service.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.inventory_service.event.publisher.EventPublisher;
import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.dto.InventoryDto;
import scms_be.inventory_service.model.dto.publisher.ItemDto;
import scms_be.inventory_service.model.entity.Inventory;
import scms_be.inventory_service.model.entity.Warehouse;
import scms_be.inventory_service.model.request.InventoryRequest.InventoryData;
import scms_be.inventory_service.repository.InventoryRepository;
import scms_be.inventory_service.repository.WarehouseRepository;

@Service
public class InventoryService {
  @Autowired
  private InventoryRepository inventoryRepository;

  @Autowired
  private WarehouseRepository warehouseRepository;
  
  @Autowired
  private EventPublisher eventPublisher;

  public InventoryDto createInventory(InventoryData inventoryRequest) {
    Inventory inventory = new Inventory();
    Warehouse warehouse = warehouseRepository.findById(inventoryRequest.getWarehouseId())
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy kho!"));

    if (inventoryRepository.existsByItemIdAndWarehouse_WarehouseId(inventoryRequest.getItemId(),
        inventoryRequest.getWarehouseId())) {
      throw new RpcException(400, "Hàng hóa này đã có tồn kho ở kho này!");
    }

    inventory.setItemId(inventoryRequest.getItemId());
    inventory.setWarehouse(warehouse);
    inventory.setQuantity(inventoryRequest.getQuantity());
    inventory.setOnDemandQuantity(inventoryRequest.getOnDemandQuantity());

    Inventory savedInventory = inventoryRepository.save(inventory);
    return convertToDto(savedInventory);
  }

  public List<InventoryDto> getInventoryByItemAndWarehouse(Long companyId, Long itemId, Long warehouseId) {
    if (warehouseId == 0 && itemId != 0) {
      List<Inventory> inventories = inventoryRepository.findAllByItemId(itemId);
      return inventories.stream()
          .map(this::convertToDto)
          .toList();
    } else if (itemId == 0 && warehouseId != 0) {
      List<Inventory> inventories = inventoryRepository.findAllByWarehouse_WarehouseId(warehouseId);
      return inventories.stream()
          .map(this::convertToDto)
          .toList();
    } else if (itemId != 0 && warehouseId != 0) {
      List<Inventory> inventories = inventoryRepository.findAllByItemIdAndWarehouse_WarehouseId(itemId,
          warehouseId);
      return inventories.stream()
          .map(this::convertToDto)
          .toList();
    } else if (itemId == 0 && warehouseId == 0) {
      List<ItemDto> items = eventPublisher.getAllItemByCompanyId(companyId);
      
      List<Inventory> inventories = new ArrayList<>();
      for (ItemDto item : items) {
        List<Inventory> itemInventories = inventoryRepository.findAllByItemId(item.getItemId());
        inventories.addAll(itemInventories);
      }
      if (inventories.isEmpty()) {
        throw new RpcException(404, "Không tìm thấy thông tin tồn kho!");
      }
      return inventories.stream()
          .map(this::convertToDto)
          .toList();
    } else {
      throw new RpcException(404, "Không tìm thấy thông tin tồn kho!");
    }
  }

  public String checkInventory(Long itemId, Long warehouseId, Double amount) {
    Inventory inventory = inventoryRepository.findByItemIdAndWarehouse_WarehouseId(itemId, warehouseId);
    if (inventory == null) {
      return "Không có tồn kho";
    }
    Double available = inventory.getQuantity() - inventory.getOnDemandQuantity();
    if (available < amount) {
      return "Không đủ";
    }
    return "Đủ";
  }

  public InventoryDto getInventoryById(long inventoryId) {
    Inventory inventory = inventoryRepository.findById(inventoryId).orElse(null);
    return convertToDto(inventory);
  }

  public InventoryDto updateInventory(Long inventoryId, InventoryData inventoryRequest) { // kiểm kê
    Inventory existingInventory = inventoryRepository.findById(inventoryId).orElse(null);
    if (existingInventory != null) {
      if (inventoryRequest.getQuantity() < inventoryRequest.getOnDemandQuantity()) {
        throw new RpcException(400, "Số lượng cần dùng không thể lớn hơn số lượng còn lại trong kho!");
      }
      existingInventory.setQuantity(inventoryRequest.getQuantity());
      existingInventory.setOnDemandQuantity(inventoryRequest.getOnDemandQuantity());
      Inventory updatedInventory = inventoryRepository.save(existingInventory);
      return convertToDto(updatedInventory);
    }
    throw new RpcException(404, "Không tìm thấy thông tin tồn kho!");
  }

  public InventoryDto increaseQuantity(InventoryData inventoryRequest) { // receive
    Inventory existingInventory = inventoryRepository.findByItemIdAndWarehouse_WarehouseId(
        inventoryRequest.getItemId(),
        inventoryRequest.getWarehouseId());

    Inventory inventory;
    if (existingInventory != null) {
      existingInventory.setQuantity(existingInventory.getQuantity() + inventoryRequest.getQuantity());
      inventory = inventoryRepository.save(existingInventory);
    } else {
      inventory = new Inventory();
      Warehouse warehouse = warehouseRepository.findById(inventoryRequest.getWarehouseId())
          .orElseThrow(() -> new RpcException(404, "Không tìm thấy kho!"));
      inventory.setItemId(inventoryRequest.getItemId());
      inventory.setWarehouse(warehouse);
      inventory.setQuantity(inventoryRequest.getQuantity());
      inventory.setOnDemandQuantity(0.0);
      inventory = inventoryRepository.save(inventory);
    }

    return convertToDto(inventory);
  }

  public InventoryDto decreaseQuantity(InventoryData inventoryRequest) { // issue
    Inventory existingInventory = inventoryRepository.findByItemIdAndWarehouse_WarehouseId(
        inventoryRequest.getItemId(),
        inventoryRequest.getWarehouseId());
    Inventory inventory;
    if (existingInventory != null) {
      if (inventoryRequest.getQuantity() > existingInventory.getQuantity()) {
        throw new RpcException(400, "Không đủ tồn kho!");
      }
      existingInventory.setQuantity(existingInventory.getQuantity() - inventoryRequest.getQuantity());
      inventory = inventoryRepository.save(existingInventory);
      return convertToDto(inventory);
    }
    throw new RpcException(404, "Không tìm thấy thông tin tồn kho!");
  }

  public InventoryDto increaseOnDemand(InventoryData inventoryRequest) {
    Inventory inventory = inventoryRepository.findByItemIdAndWarehouse_WarehouseId(
        inventoryRequest.getItemId(),
        inventoryRequest.getWarehouseId());

    if (inventory != null) {
      double availableQuantity = inventory.getQuantity() - inventory.getOnDemandQuantity();

      if (inventoryRequest.getOnDemandQuantity() > availableQuantity) {
        throw new RpcException(400, "Không đủ tồn kho!");
      }

      inventory.setOnDemandQuantity(inventory.getOnDemandQuantity() + inventoryRequest.getOnDemandQuantity());
      Inventory updated = inventoryRepository.save(inventory);
      return convertToDto(updated);
    }
    throw new RpcException(404, "Không tìm thấy thông tin tồn kho!");
  }

  public InventoryDto decreaseOnDemand(InventoryData inventoryRequest) {
    Inventory inventory = inventoryRepository.findByItemIdAndWarehouse_WarehouseId(
        inventoryRequest.getItemId(),
        inventoryRequest.getWarehouseId());
        
    if (inventory != null) {
      if (inventoryRequest.getOnDemandQuantity() > inventory.getOnDemandQuantity()) {
        throw new RpcException(400, "Không thể giảm quá số lượng cần dùng!");
      }

      inventory.setOnDemandQuantity(inventory.getOnDemandQuantity() - inventoryRequest.getOnDemandQuantity());
      Inventory updated = inventoryRepository.save(inventory);
      return convertToDto(updated);
    }
    throw new RpcException(404, "Không tìm thấy thông tin tồn kho!");
  }

  public InventoryDto convertToDto(Inventory inventory) {
    InventoryDto inventoryDto = new InventoryDto();
    inventoryDto.setInventoryId(inventory.getInventoryId());

    inventoryDto.setWarehouseId(inventory.getWarehouse().getWarehouseId());
    inventoryDto.setWarehouseName(inventory.getWarehouse().getWarehouseName());
    inventoryDto.setWarehouseCode(inventory.getWarehouse().getWarehouseCode());

    inventoryDto.setItemId(inventory.getItemId());
    ItemDto itemDto = new ItemDto();
    itemDto = eventPublisher.getItemById(inventory.getItemId());
    inventoryDto.setItemCode(itemDto.getItemCode());
    inventoryDto.setItemName(itemDto.getItemName());
    
    inventoryDto.setQuantity(inventory.getQuantity());
    inventoryDto.setOnDemandQuantity(inventory.getOnDemandQuantity());
    return inventoryDto;
  }
}
