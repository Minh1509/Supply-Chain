package scms_be.operation_service.config;

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

    // Operation Service Queue
    @Bean
    public Queue operationQueue() {
        return new Queue("operation_queue", true);
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

    // BOM bindings
    @Bean
    public Binding bomCreateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("bom.create");
    }

    @Bean
    public Binding bomGetByItemIdBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("bom.get_by_item_id");
    }

    @Bean
    public Binding bomGetAllInCompanyBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("bom.get_all_in_company");
    }

    @Bean
    public Binding bomUpdateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("bom.update");
    }

    @Bean
    public Binding bomDeleteBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("bom.delete");
    }

    // Manufacture Order bindings
    @Bean
    public Binding manufactureOrderCreateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_order.create");
    }

    @Bean
    public Binding manufactureOrderGetAllByItemBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_order.get_all_by_item");
    }

    @Bean
    public Binding manufactureOrderGetAllInCompanyBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_order.get_all_in_company");
    }

    @Bean
    public Binding manufactureOrderGetByIdBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_order.get_by_id");
    }

    @Bean
    public Binding manufactureOrderGetByCodeBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_order.get_by_code");
    }

    @Bean
    public Binding manufactureOrderUpdateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_order.update");
    }

    @Bean
    public Binding manufactureOrderReportBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_order.report");
    }

    @Bean
    public Binding manufactureOrderMonthlyReportBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_order.monthly_report");
    }

    @Bean
    public Binding manufactureOrderCompleteBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_order.complete");
    }

    // Manufacture Process bindings
    @Bean
    public Binding manufactureProcessCreateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_process.create");
    }

    @Bean
    public Binding manufactureProcessGetAllInMoBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_process.get_all_in_mo");
    }

    @Bean
    public Binding manufactureProcessGetByIdBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_process.get_by_id");
    }

    @Bean
    public Binding manufactureProcessUpdateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_process.update");
    }

    // Manufacture Stage bindings
    @Bean
    public Binding manufactureStageCreateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_stage.create");
    }

    @Bean
    public Binding manufactureStageGetByItemIdBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_stage.get_by_item_id");
    }

    @Bean
    public Binding manufactureStageGetByIdBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_stage.get_by_id");
    }

    @Bean
    public Binding manufactureStageGetAllInCompanyBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_stage.get_all_in_company");
    }

    @Bean
    public Binding manufactureStageUpdateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_stage.update");
    }

    @Bean
    public Binding manufactureStageDeleteBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("manufacture_stage.delete");
    }

    // Delivery Order bindings
    @Bean
    public Binding deliveryOrderCreateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("delivery_order.create");
    }

    @Bean
    public Binding deliveryOrderGetByIdBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("delivery_order.get_by_id");
    }

    @Bean
    public Binding deliveryOrderGetBySoBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("delivery_order.get_by_so");
    }

    @Bean
    public Binding deliveryOrderGetAllInCompanyBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("delivery_order.get_all_in_company");
    }

    @Bean
    public Binding deliveryOrderUpdateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("delivery_order.update");
    }

    // Delivery Process bindings
    @Bean
    public Binding deliveryProcessCreateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("delivery_process.create");
    }

    @Bean
    public Binding deliveryProcessGetAllByDoBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("delivery_process.get_all_by_do");
    }

    @Bean
    public Binding deliveryProcessUpdateBinding(Queue operationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(operationQueue).to(exchange).with("delivery_process.update");
    }


}
