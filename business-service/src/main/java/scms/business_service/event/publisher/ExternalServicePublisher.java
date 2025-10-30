package scms.business_service.event.publisher;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import scms.business_service.event.constants.EventConstants;
import scms.business_service.model.dto.response.external.CompanyDto;
import scms.business_service.model.dto.response.external.ItemDto;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;

import scms.business_service.exception.RpcException;

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
            var payload = Map.of(
                    "pattern", "item.get_by_id",
                    "data", Map.of("id", itemId));

            Object response = rabbitTemplate.convertSendAndReceive(
                    "amq.direct",
                    "general_queue",
                    payload);

            return response != null ? objectMapper.convertValue(response, ItemDto.class) : null;

        } catch (Exception e) {
            return null;
        }
    }
}
