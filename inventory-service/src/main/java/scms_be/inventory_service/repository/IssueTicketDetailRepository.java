package scms_be.inventory_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import scms_be.inventory_service.model.entity.IssueTicketDetail;

@Repository
public interface IssueTicketDetailRepository extends JpaRepository<IssueTicketDetail, Long> {
  
  List<IssueTicketDetail> findByTicketTicketId(Long ticketId);
}
