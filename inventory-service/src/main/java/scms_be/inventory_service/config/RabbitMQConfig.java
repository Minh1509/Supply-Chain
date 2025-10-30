package scms_be.inventory_service.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
    public Jackson2JsonMessageConverter jackson2MessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public DirectExchange exchange() {
        // NestJS mặc định dùng amq.direct
        return new DirectExchange("amq.direct");
    }

    // Inventory bindings
    @Bean
    public Binding itemCreateBinding(Queue itemQueue, DirectExchange exchange) {
        return BindingBuilder.bind(itemQueue).to(exchange).with("warehouse.create");
    }

    @Bean
    public Binding itemGetAllBinding(Queue itemQueue, DirectExchange exchange) {
        return BindingBuilder.bind(itemQueue).to(exchange).with("warehouse.get_all_in_company");
    }

    @Bean
    public Binding itemGetByIdBinding(Queue itemQueue, DirectExchange exchange) {
        return BindingBuilder.bind(itemQueue).to(exchange).with("warehouse.get_by_id");
    }

    @Bean
    public Binding itemUpdateBinding(Queue itemQueue, DirectExchange exchange) {
        return BindingBuilder.bind(itemQueue).to(exchange).with("warehouse.update");
    }

}
