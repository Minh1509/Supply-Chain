package scms_be.general_service.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.dto.ManufacturePlantDto;
import scms_be.general_service.model.entity.ManufacturePlant;
import scms_be.general_service.model.request.ManufacturePlantRequest.PlantData;
import scms_be.general_service.repository.ManufacturePlantRepository;

@Service
public class ManufacturePlantService {

  @Autowired
  private ManufacturePlantRepository manufacturePlantRepository;

  public ManufacturePlantDto createPlant(Long companyId, PlantData newPlant) {

    ManufacturePlant plant = new ManufacturePlant();
    plant.setCompanyId(companyId);
    plant.setPlantCode(generatePlantCode(companyId));
    plant.setPlantName(newPlant.getPlantName());
    plant.setDescription(newPlant.getDescription());
    return convertToDto(manufacturePlantRepository.save(plant));
  }

  public String generatePlantCode(Long companyId) {
    String prefix = "MP" + String.format("%04d", companyId);
    int count = manufacturePlantRepository.countByPlantCodeStartingWith(prefix);
    return prefix + String.format("%03d", count + 1);
  }

  public List<ManufacturePlantDto> getAllPlantsInCompany(Long companyId) {
    List<ManufacturePlant> plants = manufacturePlantRepository.findByCompanyId(companyId);
    return plants.stream().map(this::convertToDto).collect(Collectors.toList());
  }

  public ManufacturePlantDto getPlantById(Long plantId) {
    ManufacturePlant plant = manufacturePlantRepository.findById(plantId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy xưởng sản xuất!"));
    return convertToDto(plant);
  }

  public ManufacturePlantDto updatePlant(Long plantId, PlantData updatedPlant) {
    ManufacturePlant existingPlant = manufacturePlantRepository.findById(plantId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy xưởng sản xuất!"));

    existingPlant.setPlantName(updatedPlant.getPlantName());
    existingPlant.setDescription(updatedPlant.getDescription());

    return convertToDto(manufacturePlantRepository.save(existingPlant));
  }

  public boolean deletePlant(Long plantId) {
    Optional<ManufacturePlant> plant = manufacturePlantRepository.findById(plantId);
    if (plant.isPresent()) {
      manufacturePlantRepository.delete(plant.get());
      return true;
    }
    return false;
  }

  private ManufacturePlantDto convertToDto(ManufacturePlant plant) {
    ManufacturePlantDto dto = new ManufacturePlantDto();
    dto.setPlantId(plant.getPlantId());
    dto.setPlantCode(plant.getPlantCode());
    dto.setPlantName(plant.getPlantName());
    dto.setDescription(plant.getDescription());
    dto.setCompanyId(plant.getCompanyId());
    return dto;
  }
  
}

