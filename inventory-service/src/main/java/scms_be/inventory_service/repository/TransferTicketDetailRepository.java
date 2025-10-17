package scms_be.inventory_service.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.inventory_service.model.entity.TransferTicketDetail;

@Repository
public interface TransferTicketDetailRepository extends JpaRepository<TransferTicketDetail, Long> {

  List<TransferTicketDetail> findByTicketTicketId(Long ticketId);

}
