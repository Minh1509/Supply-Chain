package scms_be.general_service.model.dto.publisher;

import lombok.Data;

@Data
public class CompanyDto {
    private Long id;
    private String companyCode;
    private String taxCode;
    private String companyName;
    private String address;
    private String country;
    private String companyType;
    private String mainIndustry;
    private String representativeName;
    private String startDate;
    private String joinDate;
    private String phoneNumber;
    private String email;
    private String websiteAddress;
    private String logoUrl;
    private String status;
}
