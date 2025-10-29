package scms_be.operation_service.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "manufacture_order")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManufactureOrder {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long moId;

  @Column(name = "item_id", nullable = false)
  private Long itemId;

  @Column(name = "line_id", nullable = false)
  private Long lineId;

  @Column(unique = true, nullable = false)
  private String moCode;

  private String type;
  private Double quantity;
  private LocalDateTime estimatedStartTime;
  private LocalDateTime estimatedEndTime;
  private String createdBy;
  private LocalDateTime createdOn;
  private LocalDateTime lastUpdatedOn;
  private String status;
}
