package scms.business_service.event.publisher;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import scms.business_service.event.constants.EventConstants;
import scms.business_service.model.dto.response.external.CompanyDto;
import scms.business_service.model.dto.response.external.ItemDto;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExternalServicePublisher {
    
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    
    public CompanyDto getCompanyById(Long companyId) {
        try {
            Object response = rabbitTemplate.convertSendAndReceive(
                "amq.direct",
                EventConstants.COMPANY_FIND_ONE,
                Map.of("id", companyId)
            );
            return response != null ? objectMapper.convertValue(response, CompanyDto.class) : null;
        } catch (Exception e) {
            log.error("Error getting company {}: {}", companyId, e.getMessage());
            return null;
        }
    }
    
    public ItemDto getItemById(Long itemId) {
        try {
            Object response = rabbitTemplate.convertSendAndReceive(
                "amq.direct",
                EventConstants.ITEM_GET_BY_ID,
                Map.of("itemId", itemId)
            );
            return response != null ? objectMapper.convertValue(response, ItemDto.class) : null;
        } catch (Exception e) {
            log.error("Error getting item {}: {}", itemId, e.getMessage());
            return null;
        }
    }
}
