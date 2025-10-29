package scms_be.operation_service.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "manufacture_stage_detail")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManufactureStageDetail {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long stageDetailId;

  @ManyToOne
  @JoinColumn(name = "stageId", nullable = false)
  private ManufactureStage stage;

  private String stageName;
  private Integer stageOrder;
  private Long estimatedTime;
  private String description;
}
