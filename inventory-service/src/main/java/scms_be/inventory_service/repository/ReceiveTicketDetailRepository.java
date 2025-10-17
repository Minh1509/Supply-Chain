package scms_be.inventory_service.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import scms_be.inventory_service.model.entity.ReceiveTicketDetail;

public interface ReceiveTicketDetailRepository extends JpaRepository<ReceiveTicketDetail, Long> {
  
  List<ReceiveTicketDetail> findByTicketTicketId(Long ticketId);
  
}
