package scms_be.general_service.config;

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

    // General Service Queue
    @Bean
    public Queue generalQueue() {
        return new Queue("general_queue", true);
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

    // General bindings
    @Bean
    public Binding itemCreateBinding(Queue itemQueue, DirectExchange exchange) {
        return BindingBuilder.bind(itemQueue).to(exchange).with("item.create");
    }

    @Bean
    public Binding itemGetAllBinding(Queue itemQueue, DirectExchange exchange) {
        return BindingBuilder.bind(itemQueue).to(exchange).with("item.get_all_in_company");
    }

    @Bean
    public Binding itemGetByIdBinding(Queue itemQueue, DirectExchange exchange) {
        return BindingBuilder.bind(itemQueue).to(exchange).with("item.get_by_id");
    }

    @Bean
    public Binding itemUpdateBinding(Queue itemQueue, DirectExchange exchange) {
        return BindingBuilder.bind(itemQueue).to(exchange).with("item.update");
    }

    @Bean
    public Binding itemDeleteBinding(Queue itemQueue, DirectExchange exchange) {
        return BindingBuilder.bind(itemQueue).to(exchange).with("item.delete");
    }

    // Manufacture Plant bindings
    @Bean
    public Binding plantCreateBinding(Queue manufacturePlantQueue, DirectExchange exchange) {
        return BindingBuilder.bind(manufacturePlantQueue).to(exchange).with("manufacture_plant.create");
    }

    @Bean
    public Binding plantGetAllBinding(Queue manufacturePlantQueue, DirectExchange exchange) {
        return BindingBuilder.bind(manufacturePlantQueue).to(exchange).with("manufacture_plant.get_all_in_company");
    }

    @Bean
    public Binding plantGetByIdBinding(Queue manufacturePlantQueue, DirectExchange exchange) {
        return BindingBuilder.bind(manufacturePlantQueue).to(exchange).with("manufacture_plant.get_by_id");
    }

    @Bean
    public Binding plantUpdateBinding(Queue manufacturePlantQueue, DirectExchange exchange) {
        return BindingBuilder.bind(manufacturePlantQueue).to(exchange).with("manufacture_plant.update");
    }

    @Bean
    public Binding plantDeleteBinding(Queue manufacturePlantQueue, DirectExchange exchange) {
        return BindingBuilder.bind(manufacturePlantQueue).to(exchange).with("manufacture_plant.delete");
    }

    // Manufacture Line bindings
    @Bean
    public Binding lineCreateBinding(Queue manufactureLineQueue, DirectExchange exchange) {
        return BindingBuilder.bind(manufactureLineQueue).to(exchange).with("manufacture_line.create");
    }

    @Bean
    public Binding lineGetAllBinding(Queue manufactureLineQueue, DirectExchange exchange) {
        return BindingBuilder.bind(manufactureLineQueue).to(exchange).with("manufacture_line.get_all_in_plant");
    }

    @Bean
    public Binding lineGetByIdBinding(Queue manufactureLineQueue, DirectExchange exchange) {
        return BindingBuilder.bind(manufactureLineQueue).to(exchange).with("manufacture_line.get_by_id");
    }

    @Bean
    public Binding lineUpdateBinding(Queue manufactureLineQueue, DirectExchange exchange) {
        return BindingBuilder.bind(manufactureLineQueue).to(exchange).with("manufacture_line.update");
    }

    @Bean
    public Binding lineDeleteBinding(Queue manufactureLineQueue, DirectExchange exchange) {
        return BindingBuilder.bind(manufactureLineQueue).to(exchange).with("manufacture_line.delete");
    }

    // Product bindings
    @Bean
    public Binding productCreateBinding(Queue productQueue, DirectExchange exchange) {
        return BindingBuilder.bind(productQueue).to(exchange).with("product.create");
    }

    @Bean
    public Binding productGetAllBinding(Queue productQueue, DirectExchange exchange) {
        return BindingBuilder.bind(productQueue).to(exchange).with("product.get_all_by_item");
    }

    @Bean
    public Binding productGetByIdBinding(Queue productQueue, DirectExchange exchange) {
        return BindingBuilder.bind(productQueue).to(exchange).with("product.get_by_id");
    }

    @Bean
    public Binding productUpdateBinding(Queue productQueue, DirectExchange exchange) {
        return BindingBuilder.bind(productQueue).to(exchange).with("product.update");
    }

    @Bean
    public Binding productDeleteBinding(Queue productQueue, DirectExchange exchange) {
        return BindingBuilder.bind(productQueue).to(exchange).with("product.delete");
    }
}
