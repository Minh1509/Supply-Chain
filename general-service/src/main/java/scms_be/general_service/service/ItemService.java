package scms_be.general_service.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.dto.ItemDto;
import scms_be.general_service.model.entity.Item;
import scms_be.general_service.model.request.ItemRequest;
import scms_be.general_service.repository.ItemRepository;

@Service
public class ItemService {
    @Autowired
    private ItemRepository itemRepository;

    public ItemDto createItem(ItemRequest request) {
        System.out.println("Received createItem request: " + request);
        Long companyId = request.getCompanyId();
        ItemRequest.ItemData itemData = request.getItem();

        String itemCode = itemData.getItemCode();
        if (itemCode != null && itemRepository.existsByItemCode(itemCode)) {
            throw new RpcException(400, "Mã hàng hóa đã được sử dụng!");
        }

        Item item = new Item();
        item.setCompanyId(companyId);
        item.setItemCode(itemCode != null ? itemCode : generateItemCode(companyId));
        item.setItemName(itemData.getItemName());
        item.setItemType(itemData.getItemType());

        Boolean isSellable = itemData.getIsSellable();
        if (isSellable != null) {
            item.setIsSellable(isSellable);
        }

        item.setUom(itemData.getUom());
        item.setTechnicalSpecifications(itemData.getTechnicalSpecifications());

        Double importPrice = itemData.getImportPrice();
        if (importPrice != null) {
            item.setImportPrice(importPrice);
        }

        Double exportPrice = itemData.getExportPrice();
        if (exportPrice != null) {
            item.setExportPrice(exportPrice);
        }

        item.setDescription(itemData.getDescription());
        item = itemRepository.save(item);
        return convertToDto(item);
    }

    public List<ItemDto> getAllItemsInCompany(ItemRequest request) {
        Long companyId = request.getCompanyId();
        List<Item> items = itemRepository.findByCompanyId(companyId);
        return items.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public ItemDto getItemById(ItemRequest request) {
        Long itemId = request.getItemId();
        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) {
            throw new RpcException(404, "Không tìm thấy hàng hóa!");
        }
        return convertToDto(item);
    }

    public ItemDto updateItem(ItemRequest request) {
        Long itemId = request.getItemId();
        ItemRequest.ItemData itemData = request.getItem();
        Item existingItem = itemRepository.findById(itemId).orElse(null);
        if (existingItem == null) {
            throw new RpcException(404, "Không tìm thấy hàng hóa!");
        }
        String newItemCode = itemData.getItemCode();
        if (newItemCode != null && !existingItem.getItemCode().equals(newItemCode)) {
            if (itemRepository.existsByItemCode(newItemCode)) {
                throw new RpcException(400, "Mã hàng hóa đã được sử dụng!");
            }
            existingItem.setItemCode(newItemCode);
        }
        // Update các field khác
        if (itemData.getItemName() != null) {
            existingItem.setItemName(itemData.getItemName());
        }
        if (itemData.getItemType() != null) {
            existingItem.setItemType(itemData.getItemType());
        }
        if (itemData.getIsSellable() != null) {
            existingItem.setIsSellable(itemData.getIsSellable());
        }
        if (itemData.getUom() != null) {
            existingItem.setUom(itemData.getUom());
        }
        if (itemData.getTechnicalSpecifications() != null) {
            existingItem.setTechnicalSpecifications(itemData.getTechnicalSpecifications());
        }
        if (itemData.getImportPrice() != null) {
            existingItem.setImportPrice(itemData.getImportPrice());
        }
        if (itemData.getExportPrice() != null) {
            existingItem.setExportPrice(itemData.getExportPrice());
        }
        if (itemData.getDescription() != null) {
            existingItem.setDescription(itemData.getDescription());
        }
        existingItem = itemRepository.save(existingItem);
        return convertToDto(existingItem);
    }

    public Map<String, Object> deleteItem(ItemRequest request) {
        Long itemId = request.getItemId();
        boolean exists = itemRepository.existsById(itemId);
        if (exists) {
            itemRepository.deleteById(itemId);
        }
        return Map.of(
            "success", exists,
            "message", exists ? "Item đã được xóa thành công!" : "Không tìm thấy hàng hóa!"
        );
    }

    private String generateItemCode(Long companyId) {
        String prefix = "I" + String.format("%04d", companyId);
        int count = itemRepository.countByItemCodeStartingWith(prefix);
        return prefix + String.format("%05d", count + 1);
    }

    private ItemDto convertToDto(Item item) {
        ItemDto dto = new ItemDto();
        dto.setItemId(item.getItemId());
        dto.setCompanyId(item.getCompanyId());
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