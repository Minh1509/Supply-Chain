package scms_be.general_service.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.dto.ManufacturePlantDto;
import scms_be.general_service.model.entity.ManufacturePlant;
import scms_be.general_service.model.request.ManufacturePlantRequest;
import scms_be.general_service.repository.ManufacturePlantRepository;

@Service
public class ManufacturePlantService {
    @Autowired
    private ManufacturePlantRepository manufacturePlantRepository;

    public ManufacturePlantDto createPlant(ManufacturePlantRequest request) {
        Long companyId = request.getCompanyId();
        ManufacturePlantRequest.PlantData plantData = request.getPlant();
        ManufacturePlant plant = new ManufacturePlant();
        plant.setCompanyId(companyId);
        plant.setPlantCode(generatePlantCode(companyId));
        plant.setPlantName(plantData.getPlantName());
        plant.setDescription(plantData.getDescription());
        return convertToDto(manufacturePlantRepository.save(plant));
    }

    public String generatePlantCode(Long companyId) {
        String prefix = "MP" + String.format("%04d", companyId);
        int count = manufacturePlantRepository.countByPlantCodeStartingWith(prefix);
        return prefix + String.format("%03d", count + 1);
    }

    public List<ManufacturePlantDto> getAllPlantsInCompany(ManufacturePlantRequest request) {
        Long companyId = request.getCompanyId();
        List<ManufacturePlant> plants = manufacturePlantRepository.findByCompanyId(companyId);
        return plants.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public ManufacturePlantDto getPlantById(ManufacturePlantRequest request) {
        Long plantId = request.getPlantId();
        ManufacturePlant plant = manufacturePlantRepository.findById(plantId)
            .orElseThrow(() -> new RpcException(404, "Không tìm thấy xưởng sản xuất!"));
        return convertToDto(plant);
    }

    public ManufacturePlantDto updatePlant(ManufacturePlantRequest request) {
        Long plantId = request.getPlantId();
        ManufacturePlantRequest.PlantData plantData = request.getPlant();
        ManufacturePlant existingPlant = manufacturePlantRepository.findById(plantId)
            .orElseThrow(() -> new RpcException(404, "Không tìm thấy xưởng sản xuất!"));
        if (plantData.getPlantName() != null) {
            existingPlant.setPlantName(plantData.getPlantName());
        }
        if (plantData.getDescription() != null) {
            existingPlant.setDescription(plantData.getDescription());
        }
        return convertToDto(manufacturePlantRepository.save(existingPlant));
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
