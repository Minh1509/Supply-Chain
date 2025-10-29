package scms_be.operation_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import scms_be.operation_service.model.entity.ManufactureStageDetail;

public interface ManufactureStageDetailRepository extends JpaRepository<ManufactureStageDetail, Long> {
  
  List<ManufactureStageDetail> findByStage_StageId(Long stageId);

}
