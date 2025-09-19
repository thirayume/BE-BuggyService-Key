import {
  Controller,
  Get,
  Query,
  Param,
  Headers,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  CommissionService,
  CalculateCommissionDto,
  CalculateLevelCommissionDto,
} from "./commission.service";

@Controller("commission")
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get("calculate")
  @UsePipes(new ValidationPipe({ transform: true }))
  async calculateCommission(@Query() dto: CalculateCommissionDto) {
    return this.commissionService.calculateCommission(dto);
  }

  @Get("level-commission")
  @UsePipes(new ValidationPipe({ transform: true }))
  async calculateLevelCommission(@Query() dto: CalculateLevelCommissionDto) {
    return this.commissionService.calculateLevelCommission(dto);
  }

  @Get("network/:userId")
  async getNetworkCommissions(
    @Param("userId") userId: string,
    @Headers("user-role") userRole?: string
  ) {
    return this.commissionService.getNetworkCommissions(userId, userRole);
  }

  @Get("network-earnings/:userId")
  async getNetworkEarnings(@Param("userId") userId: string) {
    return this.commissionService.calculateNetworkEarnings(userId);
  }

  @Get("test-mlm")
  async testMLM() {
    // Test MLM level commission with $1.00 sale
    return this.commissionService.calculateLevelCommission({
      saleId: "sale-1",
      saleAmount: 1.0,
    });
  }

  @Get("admin-data")
  async getAdminData() {
    return this.commissionService.getAllUserData();
  }
}
