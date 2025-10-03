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
@Table(name = "item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Item {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long itemId;

  @Column( nullable = false)
  private Long companyId;

  @Column(unique = true, nullable = false)
  private String itemCode;

  private String itemName;
  private String itemType;
  private Boolean isSellable;
  private String uom;
  private String technicalSpecifications;
  private Double importPrice;
  private Double exportPrice;
  private String description;
}
