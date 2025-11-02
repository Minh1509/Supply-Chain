package scms_be.inventory_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import scms_be.inventory_service.model.entity.TransferTicket;

@Repository
public interface TransferTicketRepository extends JpaRepository<TransferTicket, Long> {

  List<TransferTicket> findByCompanyId(Long companyId);

  List<TransferTicket> findByFromWarehouseWarehouseId(Long warehouseId);

  int countByTicketCodeStartingWith(String prefix);

  TransferTicket findByTicketCode(String ticketCode);

  TransferTicket findByTicketId(Long referenceId);

  @Query("SELECT t FROM TransferTicket t LEFT JOIN FETCH t.transferTicketDetails WHERE t.ticketCode = :ticketCode")
  TransferTicket findByTicketCodeWithDetails(@Param("ticketCode") String ticketCode);

  @Query("SELECT t FROM TransferTicket t LEFT JOIN FETCH t.transferTicketDetails WHERE t.ticketId = :ticketId")
  TransferTicket findByTicketIdWithDetails(@Param("ticketId") Long ticketId);

}
