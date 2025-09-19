import { Module } from "@nestjs/common";
import { CommissionController } from "./commission.controller";
import { CommissionService } from "./commission.service";
import { MockDataService } from "../mock-data.service";

@Module({
  controllers: [CommissionController],
  providers: [CommissionService, MockDataService],
})
export class CommissionModule {}
