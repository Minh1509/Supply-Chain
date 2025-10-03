package scms_be.general_service.model.entity;

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
@Table(name = "manufacture_plant")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManufacturePlant {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long plantId;

  @Column(name = "company_id", nullable = false)
  private Long companyId;

  @Column(unique = true, nullable = false)
  private String plantCode;

  @Column(nullable = false)
  private String plantName;

  private String description;
}
