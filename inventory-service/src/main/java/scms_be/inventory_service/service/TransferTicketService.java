package scms_be.inventory_service.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.inventory_service.event.publisher.EventPublisher;
import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.dto.TransferTicketDetailDto;
import scms_be.inventory_service.model.dto.TransferTicketDto;
import scms_be.inventory_service.model.dto.publisher.ItemDto;
import scms_be.inventory_service.model.entity.TransferTicket;
import scms_be.inventory_service.model.entity.TransferTicketDetail;
import scms_be.inventory_service.model.entity.Warehouse;
import scms_be.inventory_service.model.request.TransferTicketDetailRequest;
import scms_be.inventory_service.model.request.TransferTicketRequest.TransferTicketData;
import scms_be.inventory_service.repository.TransferTicketDetailRepository;
import scms_be.inventory_service.repository.TransferTicketRepository;
import scms_be.inventory_service.repository.WarehouseRepository;

@Service
public class TransferTicketService {
  @Autowired
  private TransferTicketRepository transferTicketRepository;

  @Autowired
  private TransferTicketDetailRepository detailRepository;

  @Autowired
  private WarehouseRepository warehouseRepository;

  @Autowired
  private EventPublisher eventPublisher;

  public TransferTicketDto createTicket(TransferTicketData request) {
    TransferTicket ticket = new TransferTicket();
   
    Warehouse fromWarehouse = warehouseRepository.findById(request.getFromWarehouseId())
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy kho xuất!"));

    Warehouse toWarehouse = warehouseRepository.findById(request.getToWarehouseId())
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy kho nhập!"));

    if (request.getTransferTicketDetails() == null || request.getTransferTicketDetails().isEmpty()) {
      throw new RpcException(400, "Danh sách hàng hóa trong phiếu chuyển kho không được để trống!");
    }

    ticket.setCompanyId(request.getCompanyId());
    ticket.setTicketCode(generateTransferTicketCode(request.getCompanyId()));
    ticket.setFromWarehouse(fromWarehouse);
    ticket.setToWarehouse(toWarehouse);
    ticket.setReason(request.getReason());
    ticket.setCreatedBy(request.getCreatedBy());
    ticket.setCreatedOn(LocalDateTime.now());
    ticket.setLastUpdatedOn(LocalDateTime.now());
    ticket.setStatus(request.getStatus());
    ticket.setFile(request.getFile());

    TransferTicket savedTicket = transferTicketRepository.save(ticket);

    if (request.getTransferTicketDetails() != null) {
      for (TransferTicketDetailRequest detailRequest : request.getTransferTicketDetails()) {

        ItemDto item = eventPublisher.getItemById(detailRequest.getItemId());
        if (item == null) {
          throw new RpcException(404, "Không tìm thấy hàng hóa!");
        }

        TransferTicketDetail detail = new TransferTicketDetail();
        detail.setTicket(savedTicket);
        detail.setItemId(item.getItemId());
        detail.setQuantity(detailRequest.getQuantity());
        detail.setNote(detailRequest.getNote());
        detailRepository.save(detail);
      }
    }

    return convertToDto(savedTicket);
  }

  public TransferTicketDto getTicketById(Long id) {
    TransferTicket ticket = transferTicketRepository.findById(id).orElseThrow();
    return convertToDto(ticket);
  }

  public List<TransferTicketDto> getAllByCompany(Long companyId) {
    return transferTicketRepository.findByCompanyId(companyId)
        .stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public TransferTicketDto updateTicket(Long id, TransferTicketData request) {
    TransferTicket ticket = transferTicketRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy phiếu chuyển kho!"));

    if ("Đã hoàn thành".equals(ticket.getStatus())) {
      throw new RpcException(400, "Không thể cập nhật phiếu đã hoàn thành!");
    }
    if ("Đã hủy".equals(ticket.getStatus())) {
      throw new RpcException(400, "Không thể cập nhật phiếu đã bị hủy!");
    }

    if (request.getTransferTicketDetails() == null || request.getTransferTicketDetails().isEmpty()) {
      throw new RpcException(400, "Danh sách hàng hóa không được để trống!");
    }

    List<TransferTicketDetailRequest> detailRequests = request.getTransferTicketDetails();
    List<TransferTicketDetail> existingDetails = detailRepository.findByTicketTicketId(id);

    List<Long> itemIds = detailRequests.stream()
        .map(TransferTicketDetailRequest::getItemId)
        .collect(Collectors.toList());

    Set<Long> uniqueItemIds = new HashSet<>(itemIds);
    if (uniqueItemIds.size() < itemIds.size()) {
      throw new RpcException(400, "Hàng hóa trong phiếu bị trùng lặp!");
    }

    ticket.setStatus(request.getStatus());
    ticket.setLastUpdatedOn(LocalDateTime.now());
    ticket.setReason(request.getReason());
    TransferTicket updatedTicket = transferTicketRepository.save(ticket);

    for (TransferTicketDetailRequest newDetail : detailRequests) {
      ItemDto item = eventPublisher.getItemById(newDetail.getItemId());
      if (item == null) {
        throw new RpcException(404, "Không tìm thấy hàng hóa!");
      }

      TransferTicketDetail matchedDetail = existingDetails.stream()
          .filter(detail -> detail.getItemId().equals(newDetail.getItemId()))
          .findFirst()
          .orElse(null);

      if (matchedDetail != null) {
        matchedDetail.setQuantity(newDetail.getQuantity());
        matchedDetail.setNote(newDetail.getNote());
        detailRepository.save(matchedDetail);
      } else {
        TransferTicketDetail detail = new TransferTicketDetail();
        detail.setTicket(updatedTicket);
        detail.setItemId(item.getItemId());
        detail.setQuantity(newDetail.getQuantity());
        detail.setNote(newDetail.getNote());
        detailRepository.save(detail);
      }
    }

    List<Long> newItemIds = itemIds;
    for (TransferTicketDetail existingDetail : existingDetails) {
      if (!newItemIds.contains(existingDetail.getItemId())) {
        detailRepository.delete(existingDetail);
      }
    }

    return convertToDto(updatedTicket);
  }

  public String generateTransferTicketCode(Long companyId) {
    String prefix = "TT" + companyId;
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = transferTicketRepository.countByTicketCodeStartingWith(prefix);
    return prefix + year + String.format("%04d", count + 1);
  }

  private TransferTicketDto convertToDto(TransferTicket ticket) {
    TransferTicketDto dto = new TransferTicketDto();
    dto.setTicketId(ticket.getTicketId());
    dto.setCompanyId(ticket.getCompanyId());

    dto.setTicketCode(ticket.getTicketCode());

    dto.setFromWarehouseId(ticket.getFromWarehouse().getWarehouseId());
    dto.setFromWarehouseName(ticket.getFromWarehouse().getWarehouseName());
    dto.setFromWarehouseCode(ticket.getFromWarehouse().getWarehouseCode());

    dto.setToWarehouseId(ticket.getToWarehouse().getWarehouseId());
    dto.setToWarehouseName(ticket.getToWarehouse().getWarehouseName());
    dto.setToWarehouseCode(ticket.getToWarehouse().getWarehouseCode());

    dto.setReason(ticket.getReason());
    dto.setCreatedBy(ticket.getCreatedBy());
    dto.setCreatedOn(ticket.getCreatedOn());
    dto.setLastUpdatedOn(ticket.getLastUpdatedOn());
    dto.setStatus(ticket.getStatus());
    dto.setFile(ticket.getFile());

    List<TransferTicketDetailDto> details = detailRepository
        .findByTicketTicketId(ticket.getTicketId())
        .stream()
        .map(this::convertToDetailDto)
        .collect(Collectors.toList());
    dto.setTransferTicketDetails(details);
    return dto;
  }

  private TransferTicketDetailDto convertToDetailDto(TransferTicketDetail detail) {
    TransferTicketDetailDto dto = new TransferTicketDetailDto();
    dto.setTTdetailId(detail.getTTdetailId());
    dto.setTicketId(detail.getTicket().getTicketId());

    dto.setItemId(detail.getItemId());
    
    // Lấy thông tin item từ eventPublisher
    ItemDto item = eventPublisher.getItemById(detail.getItemId());
    if (item != null) {
      dto.setItemCode(item.getItemCode());
      dto.setItemName(item.getItemName());
    } else {
      dto.setItemCode("ITEM_" + detail.getItemId()); // Placeholder
      dto.setItemName("Item Name " + detail.getItemId()); // Placeholder
    }

    dto.setQuantity(detail.getQuantity());
    dto.setNote(detail.getNote());
    return dto;
  }
}
