package scms_be.operation_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import scms_be.operation_service.model.entity.ManufactureProcess;

@Repository
public interface ManufactureProcessRepository extends JpaRepository<ManufactureProcess, Long> {

  List<ManufactureProcess> findByOrder_MoId(Long moId);

}
