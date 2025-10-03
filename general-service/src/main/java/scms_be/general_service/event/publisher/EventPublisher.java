package scms_be.general_service.event.publisher;

import scms_be.general_service.event.constants.EventConstants;
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
    
    // Gửi welcome email sau khi register thành công
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
}