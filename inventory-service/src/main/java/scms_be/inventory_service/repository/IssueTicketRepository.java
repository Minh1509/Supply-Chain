package scms_be.inventory_service.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import scms_be.inventory_service.model.entity.IssueTicket;


public interface IssueTicketRepository extends JpaRepository<IssueTicket, Long> {
  
  List<IssueTicket> findByCompanyId(Long companyId);

  List<IssueTicket> findByCompanyIdAndStatusAndIssueDateBetween(Long CompanyId, String status, LocalDateTime start, LocalDateTime end);

  int countByTicketCodeStartingWith(String prefix);

}
