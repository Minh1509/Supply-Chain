package scms_be.operation_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.dto.DeliveryProcessDto;
import scms_be.operation_service.model.entity.DeliveryProcess;
import scms_be.operation_service.model.request.DeliveryProcessRequest.DeliveryProcessData;
import scms_be.operation_service.repository.DeliveryOrderRepository;
import scms_be.operation_service.repository.DeliveryProcessRepository;


@Service
public class DeliveryProcessService {

  @Autowired
  private DeliveryProcessRepository processRepository;

  @Autowired
  private DeliveryOrderRepository deliveryOrderRepository;

  public DeliveryProcessDto createDeliveryProcess(DeliveryProcessData processRequest) {
    DeliveryProcess process = new DeliveryProcess();
    process.setDeliveryOrder(deliveryOrderRepository.findById(processRequest.getDoId())
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn vận chuyển!")));
    
    process.setArrivalTime(processRequest.getArrivalTime());
    process.setLocation(processRequest.getLocation());
    process.setNote(processRequest.getNote());
    return convertToDto(processRepository.save(process));
  }

  public List<DeliveryProcessDto> getAllByDoId(Long doId) {
    List<DeliveryProcess> processes = processRepository.findByDeliveryOrder_DoId(doId);
    return processes.stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public DeliveryProcessDto updateProcess(Long doId, DeliveryProcessData request) {
    DeliveryProcess process = processRepository.findById(doId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy phiếu chuyển kho!"));
    process.setArrivalTime(LocalDateTime.now());
    processRepository.save(process);
    return convertToDto(process);
  }

  private DeliveryProcessDto convertToDto(DeliveryProcess process) {
    DeliveryProcessDto dto = new DeliveryProcessDto();
    dto.setDeliveryProcessId(process.getDeliveryProcessId());
    dto.setDoId(process.getDeliveryOrder().getDoId());
    dto.setDoCode(process.getDeliveryOrder().getDoCode());
    dto.setArrivalTime(process.getArrivalTime());
    dto.setLocation(process.getLocation());
    dto.setNote(process.getNote());
    return dto;
  }
}
