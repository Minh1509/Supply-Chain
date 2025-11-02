package scms.business_service.repository.Purchasing;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms.business_service.entity.Purchasing.RequestForQuotation;

@Repository
public interface RequestForQuotationRepository extends JpaRepository<RequestForQuotation, Long> {

  RequestForQuotation findByRfqCode(String code);

  int countByRfqCodeStartingWith(String prefix);

  List<RequestForQuotation> findByCompanyId(Long companyId);

  List<RequestForQuotation> findByRequestedCompanyId(Long requestedCompanyId);
}
