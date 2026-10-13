import { Controller, Get, Inject, ServiceUnavailableException } from "@nestjs/common";
import type { Db } from "@repo/database";
import { DRIZZLE } from "../database/database.module";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller("health")
export class HealthController {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  @Get()
  @AllowAnonymous()
  async check() {
    try {
      await this.db.execute(`SELECT 1`);
      return { status: "ok" };
    } catch (err) {
      throw new ServiceUnavailableException(`Database unreachable: ${err}`);
    }
  }
}