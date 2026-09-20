import { closeDatabase, db } from "@repo/database";
import { Global, Module, OnModuleDestroy } from "@nestjs/common";

export const DRIZZLE = "DRIZZLE";

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useValue: db
    }
  ],
  exports: [DRIZZLE]
})
export class DatabaseModule implements OnModuleDestroy {
  
  async onModuleDestroy() {
    await closeDatabase();
  }
}