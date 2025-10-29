package scms_be.general_service.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.dto.ManufactureLineDto;
import scms_be.general_service.model.entity.ManufactureLine;
import scms_be.general_service.model.entity.ManufacturePlant;
import scms_be.general_service.model.request.ManufactureLineRequest.LineData;
import scms_be.general_service.repository.ManufactureLineRepository;
import scms_be.general_service.repository.ManufacturePlantRepository;

@Service
public class ManufactureLineService {

  @Autowired
  private ManufactureLineRepository lineRepository;

  @Autowired
  private ManufacturePlantRepository manufacturePlantRepository;

  public ManufactureLineDto createLine(Long plantId, LineData newLine) {
    ManufacturePlant plant = manufacturePlantRepository.findById(plantId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy xưởng sản xuất!"));

    ManufactureLine line = new ManufactureLine();
    line.setPlant(plant);
    line.setLineCode(generateLineCode(plant.getCompanyId()));
    line.setLineName(newLine.getLineName());
    line.setCapacity(newLine.getCapacity());
    line.setDescription(newLine.getDescription());
    return convertToDto(lineRepository.save(line));
  }

  public String generateLineCode(Long companyId) {
    String prefix = "ML" + String.format("%04d", companyId);
    int count = lineRepository.countByLineCodeStartingWith(prefix);
    return prefix + String.format("%03d", count + 1);
  }

  public List<ManufactureLineDto> getAllLinesInPlant(Long plantId) {
    List<ManufactureLine> lines = lineRepository.findByPlantPlantId(plantId);
    return lines.stream().map(this::convertToDto).collect(Collectors.toList());
  }

  public List<ManufactureLineDto> getAllLinesInCompany(Long companyId) {
    List<ManufacturePlant> plants = manufacturePlantRepository.findByCompanyId(companyId);
    List<ManufactureLineDto> allLines = new ArrayList<>();

    for (ManufacturePlant plant : plants) {
      List<ManufactureLine> lines = lineRepository.findByPlantPlantId(plant.getPlantId());
      allLines.addAll(lines.stream().map(this::convertToDto).collect(Collectors.toList()));
    }

    return allLines;
  }

  public ManufactureLineDto getLineById(Long lineId) {
    ManufactureLine line = lineRepository.findById(lineId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy dây chuyền sản xuất!"));
    return convertToDto(line);
  }

  public ManufactureLineDto updateLine(Long lineId, LineData updatedLine) {
    ManufactureLine existingLine = lineRepository.findById(lineId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy dây chuyền sản xuất!"));

    existingLine.setLineName(updatedLine.getLineName());
    existingLine.setCapacity(updatedLine.getCapacity());
    existingLine.setDescription(updatedLine.getDescription());

    return convertToDto(lineRepository.save(existingLine));
  }

  public boolean deleteLine(Long lineId) {
    Optional<ManufactureLine> line = lineRepository.findById(lineId);
    if (line.isPresent()) {
      lineRepository.delete(line.get());
      return true;
    }
    return false;
  }

  private ManufactureLineDto convertToDto(ManufactureLine line) {
    ManufactureLineDto dto = new ManufactureLineDto();
    dto.setCompanyId(line.getPlant().getCompanyId());
    dto.setPlantId(line.getPlant().getPlantId());
    dto.setPlantName(line.getPlant().getPlantName());
    dto.setLineId(line.getLineId());
    dto.setLineCode(line.getLineCode());
    dto.setLineName(line.getLineName());
    dto.setCapacity(line.getCapacity());
    dto.setDescription(line.getDescription());

    return dto;
  }
}
