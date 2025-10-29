package scms_be.general_service.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.dto.ItemDto;
import scms_be.general_service.model.entity.Item;
import scms_be.general_service.model.request.ItemRequest.ItemData;
import scms_be.general_service.repository.ItemRepository;


@Service
public class ItemService {

  @Autowired
  private ItemRepository itemRepository;

  public ItemDto createItem(Long companyId, ItemData newItem) {

    if (itemRepository.existsByItemCode(newItem.getItemCode())) {
      throw new RpcException(404,"Mã hàng hóa đã được sử dụng!");
    }
    Item item = new Item();
    item.setCompanyId(companyId);
    item.setItemCode(generateItemCode(companyId));
    item.setItemName(newItem.getItemName());
    item.setItemType(newItem.getItemType());
    item.setIsSellable(newItem.getIsSellable());
    item.setUom(newItem.getUom());
    item.setTechnicalSpecifications(newItem.getTechnicalSpecifications());
    item.setImportPrice(newItem.getImportPrice());
    item.setExportPrice(newItem.getExportPrice());
    item.setDescription(newItem.getDescription());
    return convertToDto(itemRepository.save(item));
  }

  public String generateItemCode(Long companyId) {
    String prefix = "I" + String.format("%04d", companyId);
    int count = itemRepository.countByItemCodeStartingWith(prefix);
    return prefix + String.format("%05d", count + 1);
  }

  public List<ItemDto> getAllItemsInCompany(Long companyId) {
    List<Item> items = itemRepository.findByCompanyId(companyId);
    return items.stream().map(this::convertToDto).collect(Collectors.toList());
  }

  public ItemDto getItemById(Long itemId) {
    Item item = itemRepository.findById(itemId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy hàng hóa!"));
    return convertToDto(item);
  }

  public ItemDto updateItem(Long itemId, ItemData updatedItem) {
    Item existingItem = itemRepository.findById(itemId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy hàng hóa!"));

    if (!existingItem.getItemCode().equals(updatedItem.getItemCode())) {
      if (itemRepository.existsByItemCode(updatedItem.getItemCode())) {
        throw new RpcException(404, "Mã hàng hóa đã được sử dụng!");
      }
    }
    existingItem.setItemName(updatedItem.getItemName());
    existingItem.setItemType(updatedItem.getItemType());
    existingItem.setIsSellable(updatedItem.getIsSellable());
    existingItem.setUom(updatedItem.getUom());
    existingItem.setTechnicalSpecifications(updatedItem.getTechnicalSpecifications());
    existingItem.setImportPrice(updatedItem.getImportPrice());
    existingItem.setExportPrice(updatedItem.getExportPrice());
    existingItem.setDescription(updatedItem.getDescription());
    return convertToDto(itemRepository.save(existingItem));
  }

  public boolean deleteItem(Long itemId) {
    Optional<Item> item = itemRepository.findById(itemId);
    if (item.isPresent()) {
      itemRepository.delete(item.get());
      return true;
    }
    return false;
  }

  private ItemDto convertToDto(Item item) {
    ItemDto dto = new ItemDto();
    dto.setCompanyId(item.getCompanyId());
    dto.setItemId(item.getItemId());
    dto.setItemCode(item.getItemCode());
    dto.setItemName(item.getItemName());
    dto.setItemType(item.getItemType());
    dto.setIsSellable(item.getIsSellable());
    dto.setUom(item.getUom());
    dto.setTechnicalSpecifications(item.getTechnicalSpecifications());
    dto.setImportPrice(item.getImportPrice());
    dto.setExportPrice(item.getExportPrice());
    dto.setDescription(item.getDescription());

    return dto;
  }
}