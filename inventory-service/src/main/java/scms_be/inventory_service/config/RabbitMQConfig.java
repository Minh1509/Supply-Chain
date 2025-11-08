package scms_be.inventory_service.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Slf4j
@Configuration
@EnableRabbit
public class RabbitMQConfig {

    // Inventory Service Queue
    @Bean
    public Queue inventoryQueue() {
        return new Queue("inventory_queue", true);
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter converter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter);
        rabbitTemplate.setUseDirectReplyToContainer(true);
        rabbitTemplate.setReplyTimeout(60000); // 60 seconds timeout
        rabbitTemplate.setUseTemporaryReplyQueues(false);
        log.info("RabbitTemplate configured with 60 seconds timeout");
        return rabbitTemplate;
    }


    @Bean
    public DirectExchange exchange() {
        // NestJS mặc định dùng amq.direct
        return new DirectExchange("amq.direct");
    }

    // Inventory bindings
    @Bean
    public Binding  warehouseCreateBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("warehouse.create");
    }

    @Bean
    public Binding warehouseGetAllBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("warehouse.get_all_in_company");
    }

    @Bean
    public Binding warehouseGetByIdBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("warehouse.get_by_id");
    }

    @Bean
    public Binding warehouseUpdateBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("warehouse.update");
    }
    
    @Bean
    public Binding warehouseDeleteBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("warehouse.delete");
    }

    @Bean
    public Binding receiveTicketCreateBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("receive_ticket.create");
    }

    @Bean
    public Binding receiveTicketGetAllInCompanyBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("receive_ticket.get_all_in_company");
    }

    @Bean
    public Binding receiveTicketGetByIdBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("receive_ticket.get_by_id");
    }

    @Bean
    public Binding receiveTicketUpdateBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("receive_ticket.update");
    }

    @Bean
    public Binding inventoryGetByIdBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("inventory.get_by_id");
    }

    @Bean
    public Binding inventoryGetAllBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("inventory.get_all_inventory");
    }

    @Bean
    public Binding inventoryCheckBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("inventory.check");
    }

    @Bean
    public Binding inventoryCreateBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("inventory.create");
    }

    @Bean
    public Binding inventoryUpdateBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("inventory.update");
    }

    @Bean
    public Binding inventoryDeleteBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("inventory.delete");
    }

    @Bean
    public Binding inventoryIncreaseQuantityBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("inventory.increase_quantity");
    }

    @Bean
    public Binding inventoryDecreaseQuantityBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("inventory.decrease_quantity");
    }

    @Bean
    public Binding inventoryIncreaseOndemandBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("inventory.increase_ondemand");
    }

    @Bean
    public Binding inventoryDecreaseOndemandBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("inventory.decrease_ondemand");
    }

    @Bean
    public Binding issueTicketCreateBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("issue_ticket.create");
    }

    @Bean
    public Binding issueTicketGetAllInCompanyBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("issue_ticket.get_all_in_company");
    }

    @Bean
    public Binding issueTicketGetByIdBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("issue_ticket.get_by_id");
    }

    @Bean
    public Binding issueTicketUpdateBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("issue_ticket.update");
    }

    @Bean
    public Binding transferTicketCreateBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("transfer_ticket.create");
    }

    @Bean
    public Binding transferTicketGetAllInCompanyBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("transfer_ticket.get_all_in_company");
    }

    @Bean
    public Binding transferTicketGetByIdBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("transfer_ticket.get_by_id");
    }

    @Bean
    public Binding transferTicketGetByCodeBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("transfer_ticket.get_by_code");
    }

    @Bean
    public Binding transferTicketUpdateBinding(Queue inventoryQueue, DirectExchange exchange) {
        return BindingBuilder.bind(inventoryQueue).to(exchange).with("transfer_ticket.update");
    }

}
