package scms_be.inventory_service.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.dto.WarehouseDto;
import scms_be.inventory_service.model.entity.Warehouse;
import scms_be.inventory_service.model.request.WarehouseRequest.WarehouseData;
import scms_be.inventory_service.repository.WarehouseRepository;

@Service
public class WarehouseService {

  @Autowired
  private WarehouseRepository warehouseRepository;

  public WarehouseDto createWarehouse(Long companyId, WarehouseData newWarehouse) {

    Warehouse warehouse = new Warehouse();
    warehouse.setCompanyId(companyId);
    warehouse.setWarehouseCode(generateWarehouseCode(companyId));
    warehouse.setWarehouseName(newWarehouse.getWarehouseName());
    warehouse.setDescription(newWarehouse.getDescription());
    warehouse.setMaxCapacity(newWarehouse.getMaxCapacity());
    warehouse.setWarehouseType(newWarehouse.getWarehouseType());
    warehouse.setStatus(newWarehouse.getStatus());
    return convertToDto(warehouseRepository.save(warehouse));
  }

  public List<WarehouseDto> getAllWarehousesInCompany(Long companyId) {
    List<Warehouse> warehouses = warehouseRepository.findByCompanyId(companyId);
    return warehouses.stream().map(this::convertToDto).collect(Collectors.toList());
  }

  public WarehouseDto getWarehouseById(Long warehouseId) {
    Warehouse warehouse = warehouseRepository.findById(warehouseId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy kho!"));
    return convertToDto(warehouse);
  }

  public WarehouseDto updateWarehouse(Long warehouseId, WarehouseData warehouse) {
    Warehouse existingWarehouse = warehouseRepository.findById(warehouseId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy kho!"));

    existingWarehouse.setWarehouseName(warehouse.getWarehouseName());
    existingWarehouse.setDescription(warehouse.getDescription());
    existingWarehouse.setMaxCapacity(warehouse.getMaxCapacity());
    existingWarehouse.setWarehouseType(warehouse.getWarehouseType());
    existingWarehouse.setStatus(warehouse.getStatus());

    return convertToDto(warehouseRepository.save(existingWarehouse));
  }

  public String generateWarehouseCode(Long companyId) {
    String prefix = "W" + String.format("%04d", companyId);
    int count = warehouseRepository.countByWarehouseCodeStartingWith(prefix);
    return prefix + String.format("%05d", count + 1);
  }

  private WarehouseDto convertToDto(Warehouse warehouse) {
    WarehouseDto dto = new WarehouseDto();
    dto.setWarehouseId(warehouse.getWarehouseId());
    dto.setCompanyId(warehouse.getCompanyId());
    dto.setWarehouseCode(warehouse.getWarehouseCode());
    dto.setWarehouseName(warehouse.getWarehouseName());
    dto.setDescription(warehouse.getDescription());
    dto.setMaxCapacity(warehouse.getMaxCapacity());
    dto.setWarehouseType(warehouse.getWarehouseType());
    dto.setStatus(warehouse.getStatus());
    return dto;
  }
}
