package scms_be.inventory_service.repository;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import scms_be.inventory_service.model.entity.ReceiveTicket;

public interface ReceiveTicketRepository extends JpaRepository<ReceiveTicket, Long> {
  
  List<ReceiveTicket> findByCompanyId(Long companyId);

  List<ReceiveTicket> findByCompanyIdAndStatusAndLastUpdatedOnBetween(Long CompanyId, String status, LocalDateTime start, LocalDateTime end);

  int countByTicketCodeStartingWith(String prefix);

}
