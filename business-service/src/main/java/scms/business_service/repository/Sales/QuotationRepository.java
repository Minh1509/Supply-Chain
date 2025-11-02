package scms.business_service.repository.Sales;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms.business_service.entity.Sales.Quotation;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {

  Quotation findByQuotationCode(String code);

  int countByQuotationCodeStartingWith(String prefix);

  Quotation findByRfqRfqId(Long rfqId);

  List<Quotation> findByCompanyId(Long companyId);

  List<Quotation> findByRequestCompanyId(Long requestCompanyId);
}
