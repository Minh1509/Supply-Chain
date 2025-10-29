package scms.business_service.repository.Sales;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms.business_service.entity.Sales.Invoice;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

  Invoice findByCode(String code);

  int countByCodeStartingWith(String prefix);

  Invoice findBySalesOrderId(Long salesOrderId);

  List<Invoice> findBySalesCompanyId(Long salesCompanyId);
}
