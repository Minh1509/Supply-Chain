package scms.business_service.repository.Sales;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms.business_service.entity.Sales.QuotationDetail;

@Repository
public interface QuotationDetailRepository extends JpaRepository<QuotationDetail, Long> {

  List<QuotationDetail> findByQuotationQuotationId(Long quotationId);
}
