package scms_be.general_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import scms_be.general_service.model.entity.Item;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
  
  List<Item> findByCompanyId(Long companyId);

  boolean existsByItemCode(String itemCode);

  @Query("SELECT COUNT(i) FROM Item i WHERE i.itemCode LIKE :prefix%")
  int countByItemCodeStartingWith(@Param("prefix") String prefix);
  
}