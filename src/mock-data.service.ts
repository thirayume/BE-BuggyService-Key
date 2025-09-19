import { Injectable } from "@nestjs/common";

@Injectable()
export class MockDataService {
  private mockUsers = [
    {
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      referrerId: null,
    },
    {
      id: "user-456",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      referrerId: "user-123",
    },
    {
      id: "user-789",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "manager",
      referrerId: "user-456",
    },
    {
      id: "user-999",
      name: "Alice Brown",
      email: "alice@example.com",
      role: "user",
      referrerId: "user-789",
    },
  ];

  private mockSales = [
    {
      id: "sale-1",
      userId: "user-123",
      amount: 1000,
      date: new Date("2025-01-15"),
    },
    {
      id: "sale-2",
      userId: "user-123",
      amount: 2000,
      date: new Date("2025-01-20"),
    },
    {
      id: "sale-3",
      userId: "user-456",
      amount: 500,
      date: new Date("2025-01-10"),
    },
    {
      id: "sale-4",
      userId: "user-789",
      amount: 1500,
      date: new Date("2025-01-25"),
    },
    {
      id: "sale-5",
      userId: "user-999",
      amount: 1.0,
      date: new Date("2025-01-28"),
    },
  ];

  private mockReferrals = [
    { referrerId: "user-123", referredId: "user-456" },
    { referrerId: "user-456", referredId: "user-789" },
    { referrerId: "user-789", referredId: "user-999" },
  ];

  findUserById(id: string) {
    return this.mockUsers.find((user) => user.id === id);
  }

  findSaleById(id: string) {
    return this.mockSales.find((sale) => sale.id === id);
  }

  getAllSales() {
    return this.mockSales;
  }

  findSalesByUserId(userId: string, month?: number, year?: number) {
    return this.mockSales.filter((sale) => {
      if (sale.userId !== userId) return false;
      if (month && year) {
        return (
          sale.date.getMonth() + 1 === month && sale.date.getFullYear() === year
        );
      }
      return true;
    });
  }

  findReferralsByUserId(userId: string) {
    const referralIds = this.mockReferrals
      .filter((ref) => ref.referrerId === userId)
      .map((ref) => ref.referredId);

    return referralIds.map((id) => {
      const user = this.findUserById(id);
      const sales = this.findSalesByUserId(id);
      return { ...user, sales };
    });
  }
}
