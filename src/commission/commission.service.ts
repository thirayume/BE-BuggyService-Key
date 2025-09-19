import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { IsString, IsInt, IsNumber, Min, Max } from "class-validator";
import { Transform } from "class-transformer";
import { MockDataService } from "../mock-data.service";

export class CalculateCommissionDto {
  @IsString()
  userId: string;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(2020)
  @Max(2030)
  year: number;
}

export class CalculateLevelCommissionDto {
  @IsString()
  saleId: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.01)
  saleAmount: number;
}

@Injectable()
export class CommissionService {
  // MLM commission percentages by level
  private readonly COMMISSION_RATES = [
    0.6, // Level 0 (seller): 60%
    0.25, // Level 1 (direct sponsor): 25%
    0.1, // Level 2 (sponsor's sponsor): 10%
    0.05, // Level 3 (sponsor's sponsor's sponsor): 5%
  ];

  constructor(private mockData: MockDataService) {}

  async calculateCommission(dto: CalculateCommissionDto) {
    try {
      const { userId, month, year } = dto;

      const user = this.mockData.findUserById(userId);
      if (!user) {
        throw new NotFoundException("User not found");
      }

      const sales = this.mockData.findSalesByUserId(userId, month, year);

      if (!sales.length) {
        throw new NotFoundException("No sales found for the specified period");
      }

      const commission = sales.reduce(
        (sum, sale) => sum + sale.amount * 0.1,
        0
      );

      return {
        userId,
        userName: user.name,
        commission: Math.round(commission * 100) / 100,
        salesCount: sales.length,
        period: `${month}/${year}`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("Error calculating commission");
    }
  }

  async calculateLevelCommission(dto: CalculateLevelCommissionDto) {
    try {
      const { saleId, saleAmount } = dto;

      const sale = this.mockData.findSaleById(saleId);
      if (!sale) {
        throw new NotFoundException("Sale not found");
      }

      const seller = this.mockData.findUserById(sale.userId);
      if (!seller) {
        throw new NotFoundException("Seller not found");
      }

      const commissions = [];
      let currentUser = seller;

      for (
        let level = 0;
        level < this.COMMISSION_RATES.length && currentUser;
        level++
      ) {
        const rate = this.COMMISSION_RATES[level];
        const commission = saleAmount * rate;

        commissions.push({
          level,
          userId: currentUser.id,
          userName: currentUser.name,
          rate: `${rate * 100}%`,
          commission: Math.round(commission * 100) / 100,
        });

        // Move to next level (sponsor)
        if (level < this.COMMISSION_RATES.length - 1) {
          currentUser = currentUser.referrerId
            ? this.mockData.findUserById(currentUser.referrerId)
            : null;
        }
      }

      const totalCommissions = commissions.reduce(
        (sum, comm) => sum + comm.commission,
        0
      );

      return {
        saleId,
        saleAmount,
        commissions,
        totalCommissions: Math.round(totalCommissions * 100) / 100,
        verification:
          Math.abs(saleAmount - totalCommissions) < 0.01
            ? "Complete commission distribution"
            : `Partial distribution - ${(
                (totalCommissions / saleAmount) *
                100
              ).toFixed(0)}% distributed`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("Error calculating level commissions");
    }
  }

  async getNetworkCommissions(userId: string, userRole?: string) {
    try {
      if (!userRole || (userRole !== "admin" && userRole !== "manager")) {
        throw new UnauthorizedException(
          "Insufficient permissions to view network commissions"
        );
      }

      const user = this.mockData.findUserById(userId);
      if (!user) {
        throw new NotFoundException("User not found");
      }

      const referrals = this.mockData.findReferralsByUserId(userId);

      const commissions = referrals
        .map((referral) => {
          const referralCommission = referral.sales.reduce(
            (sum, sale) => sum + sale.amount * 0.05,
            0
          );

          return {
            userId: referral.id,
            userName: referral.name,
            amount: Math.round(referralCommission * 100) / 100,
            level: 1,
            salesCount: referral.sales.length,
          };
        })
        .filter((comm) => comm.amount > 0);

      return {
        networkUserId: userId,
        networkUserName: user.name,
        commissions,
        totalNetworkCommission: commissions.reduce(
          (sum, comm) => sum + comm.amount,
          0
        ),
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new BadRequestException("Error retrieving network commissions");
    }
  }

  async calculateNetworkEarnings(userId: string) {
    try {
      const user = this.mockData.findUserById(userId);
      if (!user) {
        throw new NotFoundException("User not found");
      }

      const allSales = this.mockData.getAllSales();
      let totalEarnings = 0;
      const earningsBreakdown = [];

      for (const sale of allSales) {
        const commissions = await this.calculateLevelCommission({
          saleId: sale.id,
          saleAmount: sale.amount,
        });

        const userCommission = commissions.commissions.find(
          (c) => c.userId === userId
        );
        if (userCommission) {
          totalEarnings += userCommission.commission;
          earningsBreakdown.push({
            saleId: sale.id,
            saleAmount: sale.amount,
            level: userCommission.level,
            commission: userCommission.commission,
            seller: commissions.commissions[0].userName,
          });
        }
      }

      return {
        userId,
        userName: user.name,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        earningsCount: earningsBreakdown.length,
        breakdown: earningsBreakdown,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("Error calculating network earnings");
    }
  }

  async getAllUserData() {
    return { message: "This would expose all data - security vulnerability!" };
  }
}
