import { PropertyDto } from "src/decorators";

export class SuccessResponseDto {
  @PropertyDto()
  success: boolean;
}