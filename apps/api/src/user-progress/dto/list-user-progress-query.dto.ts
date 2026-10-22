import { IsUUID, IsOptional } from "class-validator";

export class ListUserProgressQueryDto {
  @IsOptional()
  @IsUUID()
  moduleId?: string;

  @IsOptional()
  @IsUUID()
  tutorialId?: string;

  @IsOptional()
  @IsUUID()
  labId?: string;
}
