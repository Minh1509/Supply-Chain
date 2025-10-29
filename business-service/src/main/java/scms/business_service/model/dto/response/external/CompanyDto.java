package scms.business_service.model.dto.response.external;

import lombok.Data;

@Data
public class CompanyDto {
    private Long id;
    private String companyCode;
    private String companyName;
    private String phoneNumber;
    private String email;
    private String address;
    private String taxCode;
}
