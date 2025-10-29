package scms_be.operation_service.model.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "manufacture_stage")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManufactureStage {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long stageId;

  @Column(nullable = false, unique = true)
  private String stageCode;

  @Column(name = "item_id", nullable = false)
  private Long itemId;

  private String description;
  private String status;

  @OneToMany(mappedBy = "stage", orphanRemoval = true, cascade = CascadeType.ALL)
  private List<ManufactureStageDetail> stageDetails;
}
