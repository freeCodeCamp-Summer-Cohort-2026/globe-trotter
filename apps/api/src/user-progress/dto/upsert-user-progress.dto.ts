import { InferSelectModel, userProgress, userProgressStatusEnum } from "@repo/database";
import { IsUUID, IsOptional, IsEnum } from "class-validator";

export type UserProgressRow = InferSelectModel<typeof userProgress>;
export type UserProgressStatus = UserProgressRow["status"];

export class UpsertUserProgressDto {
  @IsUUID()
  moduleId!: string;

  @IsOptional()
  @IsUUID()
  tutorialId?: string | null;

  @IsOptional()
  @IsUUID()
  labId?: string | null;

  @IsEnum(userProgressStatusEnum)
  status!: UserProgressStatus;
}
