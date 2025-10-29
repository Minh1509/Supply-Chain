package scms.business_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@EnableRabbit
public class RabbitMQConfig {

    @Bean
    public Queue businessQueue() {
        return new Queue("business_queue", true);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2MessageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange("amq.direct");
    }

    // Purchase Order bindings
    @Bean
    public Binding poCreateBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("po.create");
    }

    @Bean
    public Binding poGetByIdBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("po.get_by_id");
    }

    @Bean
    public Binding poGetAllInCompanyBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("po.get_all_in_company");
    }

    @Bean
    public Binding poGetAllBySupplierBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("po.get_all_by_supplier");
    }

    @Bean
    public Binding poUpdateStatusBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("po.update_status");
    }

    @Bean
    public Binding poPurchaseReportBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("po.purchase_report");
    }

    @Bean
    public Binding poMonthlyReportBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("po.monthly_report");
    }

    // RFQ bindings
    @Bean
    public Binding rfqCreateBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("rfq.create");
    }

    @Bean
    public Binding rfqGetByIdBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("rfq.get_by_id");
    }

    @Bean
    public Binding rfqGetAllInCompanyBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("rfq.get_all_in_company");
    }

    @Bean
    public Binding rfqGetAllByRequestedCompanyBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("rfq.get_all_by_requested_company");
    }

    @Bean
    public Binding rfqUpdateStatusBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("rfq.update_status");
    }

    // Sales Order bindings
    @Bean
    public Binding soCreateBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("so.create");
    }

    @Bean
    public Binding soGetByIdBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("so.get_by_id");
    }

    @Bean
    public Binding soGetByPoIdBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("so.get_by_po_id");
    }

    @Bean
    public Binding soGetAllInCompanyBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("so.get_all_in_company");
    }

    @Bean
    public Binding soUpdateStatusBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("so.update_status");
    }

    @Bean
    public Binding soSalesReportBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("so.sales_report");
    }

    @Bean
    public Binding soMonthlyReportBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("so.monthly_report");
    }

    // Quotation bindings
    @Bean
    public Binding quotationCreateBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("quotation.create");
    }

    @Bean
    public Binding quotationGetByIdBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("quotation.get_by_id");
    }

    @Bean
    public Binding quotationGetByRfqIdBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("quotation.get_by_rfq_id");
    }

    @Bean
    public Binding quotationGetAllInCompanyBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("quotation.get_all_in_company");
    }

    @Bean
    public Binding quotationGetAllByRequestCompanyBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("quotation.get_all_by_request_company");
    }

    @Bean
    public Binding quotationUpdateStatusBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("quotation.update_status");
    }

    // Invoice bindings
    @Bean
    public Binding invoiceCreateBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("invoice.create");
    }

    @Bean
    public Binding invoiceGetByIdBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("invoice.get_by_id");
    }

    @Bean
    public Binding invoiceGetBySoIdBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("invoice.get_by_so_id");
    }

    @Bean
    public Binding invoiceGetAllInCompanyBinding(Queue businessQueue, DirectExchange exchange) {
        return BindingBuilder.bind(businessQueue).to(exchange).with("invoice.get_all_in_company");
    }
}
