package scms_be.general_service.event.publisher;

import com.fasterxml.jackson.databind.ObjectMapper;
import scms_be.general_service.event.constants.EventConstants;
import scms_be.general_service.model.dto.publisher.CompanyDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {
    
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    
    public void sendWelcomeEmail(String email, String username) {
        Map<String, String> emailData = Map.of(
            "email", email,
            "username", username,
            "template", "welcome"
        );
        
        log.info("Sending welcome email to: {}", email);
        rabbitTemplate.convertAndSend(EventConstants.NOTIFICATION_SERVICE_QUEUE, emailData);
        log.info("Welcome email event sent successfully");
    }
    
    public CompanyDto getCompanyById(Long companyId) {
        try {
            log.info("Getting company by ID: {}", companyId);
            
            var payload = Map.of(
                "pattern", "company.find-one", 
                "data", Map.of("id", companyId)
            );
            
            Object response = rabbitTemplate.convertSendAndReceive("", EventConstants.AUTH_SERVICE_QUEUE, payload);
            
            if (response == null) {
                log.warn("No response from auth service for company ID: {}", companyId);
                return null;
            }
            
            Map<String, Object> responseMap = objectMapper.convertValue(response, Map.class);
            Object data = responseMap.getOrDefault("data", response);
            
            CompanyDto companyDto = objectMapper.convertValue(data, CompanyDto.class);
            log.info("Received company data: {}", companyDto.getCompanyName());
            return companyDto;
            
        } catch (Exception e) {
            log.error("Error getting company by ID {}: {}", companyId, e.getMessage());
            return null;
        }
    }
}