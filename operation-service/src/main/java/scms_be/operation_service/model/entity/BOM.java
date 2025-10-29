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
@Table(name = "bom")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BOM {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long bomId;

  @Column(name = "item_id", nullable = false)
  private Long itemId;

  @Column(unique = true, nullable = false)
  private String bomCode;

  private String description;
  private String status;

  @OneToMany(mappedBy = "bom", orphanRemoval = true, cascade = CascadeType.ALL)
  private List<BOMDetail> bomDetails;

}
