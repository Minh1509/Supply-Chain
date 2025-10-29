package scms_be.operation_service.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.dto.ManufactureProcessDto;
import scms_be.operation_service.model.entity.ManufactureProcess;
import scms_be.operation_service.model.request.ManuProcessRequest.ManuProcessData;
import scms_be.operation_service.repository.ManufactureOrderRepository;
import scms_be.operation_service.repository.ManufactureProcessRepository;
import scms_be.operation_service.repository.ManufactureStageDetailRepository;

@Service
public class ManufactureProcessService {

  @Autowired
  private ManufactureProcessRepository processRepository;
  @Autowired
  private ManufactureOrderRepository manufactureOrderRepository;
  @Autowired
  private ManufactureStageDetailRepository stageDetailRepository;

  public ManufactureProcessDto createManuProcess(ManuProcessData processRequest) {
    ManufactureProcess process = new ManufactureProcess();
    process.setStartedOn(processRequest.getStartedOn());
    process.setFinishedOn(processRequest.getFinishedOn());
    process.setStatus("Chưa thực hiện");

    process.setOrder(manufactureOrderRepository.findById(processRequest.getMoId())
    .orElseThrow(() -> new RpcException(404, "Không tìm thấy công lệnh sản xuất!")));
  process.setStageDetail(stageDetailRepository.findById(processRequest.getStageDetailId())
    .orElseThrow(() -> new RpcException(404, "Chưa thiết lập công đoạn sản xuất cho hàng hóa này!")));

    return convertToDto(processRepository.save(process));
  }

  public List<ManufactureProcessDto> getAllByMoId(Long moId) {
    List<ManufactureProcess> processes = processRepository.findByOrder_MoId(moId);
    return processes.stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public ManufactureProcessDto getById(Long id) {
  ManufactureProcess process = processRepository.findById(id)
    .orElseThrow(() -> new RpcException(404, "Không tìm thấy quá trình sản xuất!"));
    return convertToDto(process);
  }

  public ManufactureProcessDto update(Long id, ManuProcessData processUpdate) {
    ManufactureProcess process = processRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy quá trình sản xuất!"));
    process.setStartedOn(processUpdate.getStartedOn());
    process.setFinishedOn(processUpdate.getFinishedOn());
    process.setStatus(processUpdate.getStatus());
    return convertToDto(processRepository.save(process));
  }

  private ManufactureProcessDto convertToDto(ManufactureProcess process) {
    ManufactureProcessDto dto = new ManufactureProcessDto();
    dto.setId(process.getId());

    dto.setMoId(process.getOrder().getMoId());
    dto.setMoCode(process.getOrder().getMoCode());

    dto.setStageDetailId(process.getStageDetail().getStageDetailId());
    dto.setStageDetailName(process.getStageDetail().getStageName());
    dto.setStageDetailOrder(process.getStageDetail().getStageOrder());

    dto.setStartedOn(process.getStartedOn());

    dto.setFinishedOn(process.getFinishedOn());
    dto.setStatus(process.getStatus());
    return dto;
  }
}
