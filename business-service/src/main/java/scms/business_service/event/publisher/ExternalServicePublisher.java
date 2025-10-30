package scms.business_service.event.publisher;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import scms.business_service.model.dto.response.external.CompanyDto;
import scms.business_service.model.dto.response.external.ItemDto;
import scms.business_service.model.dto.response.external.WarehouseDto;
import scms.business_service.model.event.GenericEvent;

import java.util.Map;

@Slf4j
@Component
public class ExternalServicePublisher {

    private final RabbitTemplate rabbitTemplate;

    private final ObjectMapper objectMapper;

    @Autowired
    public ExternalServicePublisher(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    public CompanyDto getCompanyById(Long id) {
        try {
            var payload = Map.of("pattern", "company.find-one", "data", Map.of("id", id));

            var res = rabbitTemplate.convertSendAndReceive("", "auth_queue", payload);

            if (res == null)
                return null;

            var map = objectMapper.convertValue(res, Map.class);
            return objectMapper.convertValue(map.getOrDefault("data", map), CompanyDto.class);

        } catch (Exception e) {
            return null;
        }
    }

    public ItemDto getItemById(Long itemId) {
        try {

            GenericEvent event = new GenericEvent();
            event.setPattern("item.get_by_id");
            event.setData(Map.of("itemId", itemId));

            Object response = rabbitTemplate.convertSendAndReceive(
                    "amq.direct",
                    "item.get_by_id",
                    event);
            if (response == null) {
                return null;
            }
            return objectMapper.convertValue(response, ItemDto.class);
        } catch (Exception e) {
            return null;
        }
    }

    public WarehouseDto getWarehouseById(Long warehouseId) {
        try {

            GenericEvent event = new GenericEvent();
            event.setPattern("warehouse.get_by_id");
            event.setData(Map.of("warehouseId", warehouseId));

            Object response = rabbitTemplate.convertSendAndReceive(
                    "amq.direct",
                    "warehouse.get_by_id",
                    event);
            if (response == null) {
                return null;
            }

            return objectMapper.convertValue(response, WarehouseDto.class);
        } catch (Exception e) {
            return null;
        }
    }
}
