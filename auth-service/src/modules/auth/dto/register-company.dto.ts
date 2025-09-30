export class RegisterCompanyDto {
  // Thông tin công ty
  companyName: string;
  taxCode: string;
  address: string;
  country: string;
  companyType: string;
  mainIndustry: string;
  representativeName: string;
  startDate: Date;
  phoneNumber: string;
  email: string;
  websiteAddress: string;

  // Thông tin nhân viên
  employeeCode: string;
  position: string;
  password: string;
}
