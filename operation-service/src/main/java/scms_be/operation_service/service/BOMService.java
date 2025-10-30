package scms_be.operation_service.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.operation_service.event.publisher.EventPublisher;
import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.dto.BOMDetailDto;
import scms_be.operation_service.model.dto.BOMDto;
import scms_be.operation_service.model.dto.publisher.ItemDto;
import scms_be.operation_service.model.entity.BOM;
import scms_be.operation_service.model.entity.BOMDetail;
import scms_be.operation_service.model.request.BOMDetailRequest;
import scms_be.operation_service.model.request.BOMRequest.BOMData;
import scms_be.operation_service.repository.BOMDetailRepository;
import scms_be.operation_service.repository.BOMRepository;

@Service
public class BOMService {

  @Autowired
  private BOMRepository bomRepository;

  @Autowired
  private BOMDetailRepository bomDetailRepository;

  @Autowired
  private EventPublisher eventPublisher;

  public BOMDto createBOM(BOMData request) {
    ItemDto item = eventPublisher.getItemById(request.getItemId());
    if (item == null) {
      throw new RpcException(404, "Không tìm thấy hàng hóaaaa!");
    }
    // Company company = item.getCompany();
    // List<BOM> existingBOMs = bomRepository.findByItem_Company_CompanyId(company.getCompanyId());
    // for (BOM existingBOM : existingBOMs) {
    //   if (existingBOM.getItemId().equals(item.getItemId())) {
    //     throw new RpcException(400, "Hàng hóa đã có BOM!");
    //   }
    // }
    if(bomRepository.existsByItemId(item.getItemId())) {
      throw new RpcException(400, "Hàng hóa đã có BOM!");
    }
    if (request.getBomDetails() == null || request.getBomDetails().isEmpty()) {
      throw new RpcException(400, "Danh sách NVL không được để trống!");
    }

    BOM bom = new BOM();
    bom.setItemId(item.getItemId());
    bom.setBomCode(generateNewBomCode(item.getItemId()));
    bom.setDescription(request.getDescription());
    bom.setStatus("Đang sử dụng");

    BOM savedBOM = bomRepository.save(bom);

    for (BOMDetailRequest newdetail : request.getBomDetails()) {
      if (newdetail.getItemId().equals(savedBOM.getItemId())) {
        throw new RpcException(400, "NVL không được trùng với hàng hóa của BOM!");
      }

      ItemDto detailItem = eventPublisher.getItemById(newdetail.getItemId());
      if (detailItem == null) {
        throw new RpcException(404, "Không tìm thấy NVL!");
      }
      List<BOMDetail> existingDetails = bomDetailRepository.findByBom_BomId(savedBOM.getBomId());
      boolean isDuplicate = existingDetails.stream()
          .anyMatch(detail -> detail.getItemId().equals(detailItem.getItemId()));
      if (isDuplicate) {
        throw new RpcException(400, "NVL này đã tồn tại trong BOM!");
      }

      BOMDetail detail = new BOMDetail();
      detail.setBom(savedBOM);
      detail.setItemId(detailItem.getItemId());
      detail.setQuantity(newdetail.getQuantity());
      detail.setNote(newdetail.getNote());

      bomDetailRepository.save(detail);
    }

    return convertToDto(savedBOM);
  }

  public List<BOMDto> getAllBOMInCom(Long companyId) {
    List<ItemDto> items = eventPublisher.GetItemAllByCompanyId(companyId);
    List<BOMDto> bomDtos = items.stream()
        .map(item -> {
          BOM bom = bomRepository.findByItemId(item.getItemId());
          if (bom != null) {
            return convertToDto(bom);
          }
          return null;
        })
        .filter(bomDto -> bomDto != null)
        .collect(Collectors.toList());
    return bomDtos;
  }

  public BOMDto getBOMByItem(Long itemId) {
    BOM bom = bomRepository.findByItemId(itemId);
    if (bom == null) {
      throw new RpcException(404, "Không tìm thấy BOM!");
    }
    return convertToDto(bom);
  }

  public BOMDto updateBOM(Long bomId, BOMData request) {
  BOM bom = bomRepository.findById(bomId)
    .orElseThrow(() -> new RpcException(404, "Không tìm thấy BOM!"));
        
    if (request.getBomDetails() == null || request.getBomDetails().isEmpty()) {
      throw new RpcException(400, "Danh sách NVL không được để trống!");
    }
    bom.setDescription(request.getDescription());
    bom.setStatus(request.getStatus());
    BOM updatedBOM = bomRepository.save(bom);

    List<BOMDetailRequest> detailRequests = request.getBomDetails();
    List<BOMDetail> existingDetails = bomDetailRepository.findByBom_BomId(bomId);

    List<Long> detailItemIds = request.getBomDetails().stream()
        .map(BOMDetailRequest::getItemId)
        .collect(Collectors.toList());

    Set<Long> uniqueItemIds = new HashSet<>(detailItemIds);
    if (uniqueItemIds.size() < detailItemIds.size()) {
      throw new RpcException(400, "NVL trong BOM bị trùng lặp!");
    }

    if (detailItemIds.contains(request.getItemId())) {
      throw new RpcException(400, "NVL không được trùng với hàng hóa của BOM!");
    }

    for (BOMDetailRequest newDetail : detailRequests) {
      if (newDetail.getItemId().equals(updatedBOM.getItemId())) {
        throw new RpcException(400, "NVL không được trùng với hàng hóa của BOM!");
      }

    ItemDto item = eventPublisher.getItemById(newDetail.getItemId());
      if (item == null) {
        throw new RpcException(404, "Không tìm thấy NVL!");
      }
      BOMDetail matchedDetail = existingDetails.stream()
          .filter(detail -> detail.getItemId().equals(newDetail.getItemId()))
          .findFirst()
          .orElse(null);

      if (matchedDetail != null) {
        matchedDetail.setQuantity(newDetail.getQuantity());
        matchedDetail.setNote(newDetail.getNote());
        bomDetailRepository.save(matchedDetail);
      } else {
        BOMDetail detail = new BOMDetail();
        detail.setBom(bom);
        detail.setItemId(item.getItemId());
        detail.setQuantity(newDetail.getQuantity());
        detail.setNote(newDetail.getNote());
        bomDetailRepository.save(detail);
      }
    }

    List<Long> newItemIds = detailRequests.stream()
        .map(BOMDetailRequest::getItemId)
        .collect(Collectors.toList());

    for (BOMDetail existingDetail : existingDetails) {
      if (!newItemIds.contains(existingDetail.getItemId())) {
        bomDetailRepository.delete(existingDetail);
      }
    }

    return convertToDto(updatedBOM);
  }

  public void deleteBOM(Long bomId) {
    if (!bomRepository.existsById(bomId)) {
      throw new RpcException(404, "Không tìm thấy BOM!");
    }
    bomRepository.deleteById(bomId);
  }

  private String generateNewBomCode(Long itemId) {
    String prefix = "BOM" + itemId;
    int count = bomRepository.countByBomCodeStartingWith(prefix);
    return prefix + String.format("%04d", count + 1);
  }

  private BOMDto convertToDto(BOM bom) {
    BOMDto dto = new BOMDto();
    dto.setBomId(bom.getBomId());
    dto.setBomCode(bom.getBomCode());

    ItemDto item = eventPublisher.getItemById(bom.getItemId());
    if (item == null) {
      throw new RpcException(404, "Không tìm thấy hàng hóas!");
    }
    dto.setItemId(item.getItemId());
    dto.setItemCode(item.getItemCode());
    dto.setItemName(item.getItemName());

    dto.setDescription(bom.getDescription());
    dto.setStatus(bom.getStatus());

    List<BOMDetailDto> details = bomDetailRepository
        .findByBom_BomId(bom.getBomId())
        .stream()
        .map(this::convertToDetailDto)
        .collect(Collectors.toList());

    dto.setBomDetails(details);
    return dto;
  }

  private BOMDetailDto convertToDetailDto(BOMDetail detail) {
    BOMDetailDto dto = new BOMDetailDto();
    dto.setId(detail.getId());
    dto.setBomId(detail.getBom().getBomId());

    ItemDto itemDetailDto = eventPublisher.getItemById(detail.getItemId());
    if (itemDetailDto == null) {
      throw new RpcException(404, "Không tìm thấy NVL!");
    }
    dto.setItemId(itemDetailDto.getItemId());
    dto.setItemName(itemDetailDto.getItemName());
    dto.setItemCode(itemDetailDto.getItemCode());

    dto.setQuantity(detail.getQuantity());
    dto.setNote(detail.getNote());
    return dto;
  }
}
