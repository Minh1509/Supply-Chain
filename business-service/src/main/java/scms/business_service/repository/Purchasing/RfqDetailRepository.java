package scms.business_service.repository.Purchasing;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms.business_service.entity.Purchasing.RfqDetail;

@Repository
public interface RfqDetailRepository extends JpaRepository<RfqDetail, Long> {

  List<RfqDetail> findByRfqRfqId(Long rfqId);
}
