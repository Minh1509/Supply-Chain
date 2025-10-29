package scms_be.operation_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.operation_service.model.entity.BOMDetail;

@Repository
public interface BOMDetailRepository extends JpaRepository<BOMDetail, Long> {

  void deleteByBom_BomId(Long bomId);

  List<BOMDetail> findByBom_BomId(Long bomId);

}
