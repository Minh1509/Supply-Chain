package scms_be.general_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableRabbit
public class RabbitMQConfig {

    @Bean
    public Queue generalQueue() {
        return new Queue("general_queue", true);
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
        rabbitTemplate.setReplyTimeout(60000);
        rabbitTemplate.setUseTemporaryReplyQueues(false);
        log.info("RabbitTemplate configured with 60 seconds timeout");
        return rabbitTemplate;
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange("amq.direct");
    }

    @Bean
    public Binding itemCreateBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("item.create");
    }

    @Bean
    public Binding itemGetAllBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("item.get_all_in_company");
    }

    @Bean
    public Binding itemGetByIdBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("item.get_by_id");
    }

    @Bean
    public Binding itemGetByIdsBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("item.get_by_ids");
    }

    @Bean
    public Binding itemUpdateBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("item.update");
    }

    @Bean
    public Binding itemDeleteBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("item.delete");
    }

    @Bean
    public Binding plantCreateBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("manufacture_plant.create");
    }

    @Bean
    public Binding plantGetAllBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("manufacture_plant.get_all_in_company");
    }

    @Bean
    public Binding plantGetByIdBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("manufacture_plant.get_by_id");
    }

    @Bean
    public Binding plantUpdateBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("manufacture_plant.update");
    }

    @Bean
    public Binding lineCreateBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("manufacture_line.create");
    }

    @Bean
    public Binding lineGetAllBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("manufacture_line.get_all_in_plant");
    }

    @Bean
    public Binding lineGetByIdBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("manufacture_line.get_by_id");
    }

    @Bean
    public Binding lineUpdateBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("manufacture_line.update");
    }

    @Bean
    public Binding productGetByIdBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("product.get_by_id");
    }

    @Bean
    public Binding productGetByCompanyBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("product.get_by_company");
    }
    @Bean
    public Binding productGetByBatchBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("product.get_by_batch");
    }

    @Bean
    public Binding productBatchCreateBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("product.batch_create");
    }

    @Bean
    public Binding productScanDetailBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("product.scan_detail");
    }

    @Bean
    public Binding productGenerateBatchQrPdfBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("product.generate_batch_qr_pdf");
    }

    @Bean
    public Binding productUpdateBatchStatusBinding(Queue generalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generalQueue).to(exchange).with("product.update_batch_status");
    }
}
