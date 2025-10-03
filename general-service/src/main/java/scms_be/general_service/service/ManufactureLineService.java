package scms_be.general_service.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.dto.ManufactureLineDto;
import scms_be.general_service.model.entity.ManufactureLine;
import scms_be.general_service.model.entity.ManufacturePlant;
import scms_be.general_service.model.request.ManufactureLineRequest;
import scms_be.general_service.repository.ManufactureLineRepository;
import scms_be.general_service.repository.ManufacturePlantRepository;

@Service
public class ManufactureLineService {
    @Autowired
    private ManufactureLineRepository lineRepository;
    @Autowired
    private ManufacturePlantRepository plantRepository;

    public ManufactureLineDto createLine(ManufactureLineRequest request) {
        Long plantId = request.getPlantId();
        ManufactureLineRequest.LineData lineData = request.getLine();
        ManufacturePlant plant = plantRepository.findById(plantId)
            .orElseThrow(() -> new RpcException(404, "Không tìm thấy xưởng sản xuất!"));
        
        ManufactureLine line = new ManufactureLine();
        line.setPlant(plant);
        line.setLineCode(generateLineCode(plantId));
        line.setLineName(lineData.getLineName());
        line.setCapacity(lineData.getCapacity());
        line.setDescription(lineData.getDescription());
        return convertToDto(lineRepository.save(line));
    }

    public List<ManufactureLineDto> getAllLinesInPlant(ManufactureLineRequest request) {
        Long plantId = request.getPlantId();
        List<ManufactureLine> lines = lineRepository.findByPlantPlantId(plantId);
        return lines.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public ManufactureLineDto getLineById(ManufactureLineRequest request) {
        Long lineId = request.getLineId();
        ManufactureLine line = lineRepository.findById(lineId)
            .orElseThrow(() -> new RpcException(404, "Không tìm thấy dây chuyền sản xuất!"));
        return convertToDto(line);
    }

    public ManufactureLineDto updateLine(ManufactureLineRequest request) {
        Long lineId = request.getLineId();
        ManufactureLineRequest.LineData lineData = request.getLine();
        ManufactureLine existingLine = lineRepository.findById(lineId)
            .orElseThrow(() -> new RpcException(404, "Không tìm thấy dây chuyền sản xuất!"));
        if (lineData.getLineName() != null) {
            existingLine.setLineName(lineData.getLineName());
        }
        if (lineData.getCapacity() != null) {
            existingLine.setCapacity(lineData.getCapacity());
        }
        if (lineData.getDescription() != null) {
            existingLine.setDescription(lineData.getDescription());
        }
        return convertToDto(lineRepository.save(existingLine));
    }

    public boolean deleteLine(ManufactureLineRequest request) {
        Long lineId = request.getLineId();
        if (lineRepository.existsById(lineId)) {
            lineRepository.deleteById(lineId);
            return true;
        }
        return false;
    }

    public String generateLineCode(Long plantId) {
        String prefix = "ML" + String.format("%04d", plantId);
        int count = lineRepository.countByLineCodeStartingWith(prefix);
        return prefix + String.format("%03d", count + 1);
    }

    private ManufactureLineDto convertToDto(ManufactureLine line) {
        ManufactureLineDto dto = new ManufactureLineDto();
        dto.setLineId(line.getLineId());
        dto.setLineCode(line.getLineCode());
        dto.setLineName(line.getLineName());
        dto.setCapacity(line.getCapacity());
        dto.setPlantId(line.getPlant().getPlantId());
        dto.setPlantName(line.getPlant().getPlantName());
        dto.setCompanyId(line.getPlant().getCompanyId());
        return dto;
    }
}