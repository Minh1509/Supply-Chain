package scms_be.operation_service.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.operation_service.event.publisher.EventPublisher;
import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.dto.ManufactureStageDetailDto;
import scms_be.operation_service.model.dto.ManufactureStageDto;
import scms_be.operation_service.model.dto.publisher.ItemDto;
import scms_be.operation_service.model.entity.ManufactureStage;
import scms_be.operation_service.model.entity.ManufactureStageDetail;
import scms_be.operation_service.model.request.ManuStageDetailRequest;
import scms_be.operation_service.model.request.ManuStageRequest.ManuStageData;
import scms_be.operation_service.repository.ManufactureStageDetailRepository;
import scms_be.operation_service.repository.ManufactureStageRepository;

@Service
public class ManufactureStageService {

  @Autowired
  private ManufactureStageRepository stageRepository;

  @Autowired
  private EventPublisher eventPublisher;

  @Autowired
  private ManufactureStageDetailRepository stageDetailRepository;

  public ManufactureStageDto createStage(ManuStageData stageRequest) {

    if (stageRequest.getStageDetails() == null || stageRequest.getStageDetails().isEmpty()) {
      throw new RpcException(400, "Danh sách công đoạn không được để trống!");
    }

    ManufactureStage stage = new ManufactureStage();
    stage.setStageCode(generateStageCode(stageRequest.getItemId()));

    stage.setDescription(stageRequest.getDescription());
    stage.setStatus(stageRequest.getStatus());

    ItemDto item = eventPublisher.getItemById(stageRequest.getItemId());
    if (item == null) {
      throw new RpcException(404, "Không tìm thấy hàng hóa!");
    }
    stage.setItemId(item.getItemId());

    ManufactureStage saveStage = stageRepository.save(stage);

    for (ManuStageDetailRequest detailRequest : stageRequest.getStageDetails()) {
      ManufactureStageDetail stageDetail = new ManufactureStageDetail();

      stageDetail.setStage(saveStage);
      stageDetail.setStageName(detailRequest.getStageName());
      stageDetail.setStageOrder(detailRequest.getStageOrder());
      stageDetail.setEstimatedTime(detailRequest.getEstimatedTime());
      stageDetail.setDescription(detailRequest.getDescription());

      stageDetailRepository.save(stageDetail);
    }

    return convertToDto(saveStage);
  }

  public String generateStageCode(Long itemId) {
    String prefix = "MS" + itemId;
    int count = stageRepository.countByStageCodeStartingWith(prefix);
    return prefix + String.format("%02d", count + 1);
  }

  public ManufactureStageDto getStagesByItemId(Long itemId) {
    return convertToDto(stageRepository.findByItemId(itemId));
  }

  public ManufactureStageDto getStageById(Long stageId) {
  ManufactureStage stage = stageRepository.findById(stageId)
    .orElseThrow(() -> new RpcException(404, "Không tìm thấy công đoạn sản xuất!"));
    return convertToDto(stage);
  }

  public List<ManufactureStageDto> getAllStagesInCompany(Long companyId) {
    List<ItemDto> items = eventPublisher.GetItemAllByCompanyId(companyId);
    List<ManufactureStageDto> stageDtos = items.stream()
        .map(item -> {
          ManufactureStage stage = stageRepository.findByItemId(item.getItemId());
          if (stage != null) {
            return convertToDto(stage);
          }
          return null;
        })
        .filter(stageDto -> stageDto != null)
        .toList();
    return stageDtos;
  }

  public ManufactureStageDto updateStage(Long stageId, ManuStageData stage) {
  ManufactureStage exist = stageRepository.findById(stageId)
    .orElseThrow(() -> new RpcException(404, "Không tìm thấy công đoạn sản xuất!"));

    if (stage.getStageDetails() == null || stage.getStageDetails().isEmpty()) {
      throw new RpcException(400, "Danh sách công đoạn không được để trống!");
    }

    exist.setDescription(stage.getDescription());
    exist.setStatus(stage.getStatus());

    for (ManuStageDetailRequest detailRequest : stage.getStageDetails()) {
      ManufactureStageDetail stageDetail = new ManufactureStageDetail();
      stageDetail.setStage(exist);
      stageDetail.setStageName(detailRequest.getStageName());
      stageDetail.setStageOrder(detailRequest.getStageOrder());
      stageDetail.setEstimatedTime(detailRequest.getEstimatedTime());
      stageDetail.setDescription(detailRequest.getDescription());

      stageDetailRepository.save(stageDetail);
    }
    return convertToDto(stageRepository.save(exist));
  }

  public void deleteStage(Long stageId) {
  ManufactureStage exist = stageRepository.findById(stageId)
    .orElseThrow(() -> new RpcException(404, "Không tìm thấy công đoạn sản xuất!"));
    stageRepository.delete(exist);
  }

  private ManufactureStageDto convertToDto(ManufactureStage stage) {
    ManufactureStageDto dto = new ManufactureStageDto();
    dto.setStageId(stage.getStageId());
    dto.setStageCode(stage.getStageCode());

    ItemDto item = eventPublisher.getItemById(stage.getItemId());
    if (item == null) {
      throw new RpcException(404, "Không tìm thấy hàng hóa!");
    }
    dto.setItemId(item.getItemId());
    dto.setItemCode(item.getItemCode());
    dto.setItemName(item.getItemName());
    dto.setDescription(stage.getDescription());
    dto.setStatus(stage.getStatus());

    List<ManufactureStageDetailDto> details = stageDetailRepository
        .findByStage_StageId(stage.getStageId())
        .stream()
        .map(this::convertToDetailDto)
        .toList();
    dto.setStageDetails(details);

    return dto;
  }

  public ManufactureStageDetailDto convertToDetailDto(ManufactureStageDetail stageDetail) {
    ManufactureStageDetailDto dto = new ManufactureStageDetailDto();
    dto.setStageDetailId(stageDetail.getStageDetailId());
    dto.setStageId(stageDetail.getStage().getStageId());
    dto.setStageName(stageDetail.getStageName());
    dto.setStageOrder(stageDetail.getStageOrder());
    dto.setEstimatedTime(stageDetail.getEstimatedTime());
    dto.setDescription(stageDetail.getDescription());
    return dto;
  }
}
