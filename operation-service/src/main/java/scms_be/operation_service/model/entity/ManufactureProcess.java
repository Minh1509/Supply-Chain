package scms_be.operation_service.model.entity;

import java.time.LocalDateTime;

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
@Table(name = "manufacture_process")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManufactureProcess {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "mo_id")
  private ManufactureOrder order;

  @ManyToOne
  @JoinColumn(name = "stage_detail_id")
  private ManufactureStageDetail stageDetail;

  private LocalDateTime startedOn;
  private LocalDateTime finishedOn;
  private String status;
}
