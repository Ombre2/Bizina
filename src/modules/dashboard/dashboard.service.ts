import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Mission, MissionStatus } from '../mission/entities/mission.entity';
import { Product } from '../products/entities/product.entity';
import { Purchase } from '../purchase/entities/purchase.entity';
import { Sale } from '../sales/entities/sale.entity';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';

type LowStockItem = {
  productId: string;
  productName: string;
  quantity: number;
  baseUnitSymbol: string | null;
};

type RecentSale = {
  id: string;
  saleDate: Date;
  totalAmount: number;
  customerName: string;
};

type DailyTrendItem = {
  date: string;
  sales: number;
  purchases: number;
  expenses: number;
  gross: number;
  net: number;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
  ) {}

  private buildLastDays(count: number): string[] {
    const days: string[] = [];
    const today = new Date();

    for (let i = count - 1; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      // Utilise le timezone local (aligné avec MySQL) au lieu de UTC
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      days.push(`${yyyy}-${mm}-${dd}`);
    }

    return days;
  }

  async getSummary() {
    const [
      totalProducts,
      totalCustomers,
      ongoingMissions,
      salesTotalRaw,
      purchasesTotalRaw,
      expensesTotalRaw,
      salesTodayRaw,
      purchasesTodayRaw,
      expensesTodayRaw,
      salesByDayRaw,
      purchasesByDayRaw,
      expensesByDayRaw,
      missionStatusRaw,
      recentSales,
      lowStock,
    ] = await Promise.all([
      this.productRepository.count(),
      this.customerRepository.count(),
      this.missionRepository.count({
        where: { status: MissionStatus.ONGOING },
      }),
      this.saleRepository
        .createQueryBuilder('sale')
        .select('COALESCE(SUM(sale.totalAmount), 0)', 'total')
        .getRawOne<{ total: string }>(),
      this.purchaseRepository
        .createQueryBuilder('purchase')
        .select('COALESCE(SUM(purchase.totalAmount), 0)', 'total')
        .getRawOne<{ total: string }>(),
      this.expenseRepository
        .createQueryBuilder('expense')
        .select('COALESCE(SUM(expense.amount), 0)', 'total')
        .getRawOne<{ total: string }>(),
      // "Aujourd'hui" basé sur CURDATE() MySQL pour rester cohérent avec le chart 7 jours
      this.saleRepository
        .createQueryBuilder('sale')
        .select('COALESCE(SUM(sale.totalAmount), 0)', 'total')
        .where('DATE(sale.saleDate) = CURDATE()')
        .getRawOne<{ total: string }>(),
      this.purchaseRepository
        .createQueryBuilder('purchase')
        .select('COALESCE(SUM(purchase.totalAmount), 0)', 'total')
        .where('DATE(purchase.purchaseDate) = CURDATE()')
        .getRawOne<{ total: string }>(),
      this.expenseRepository
        .createQueryBuilder('expense')
        .select('COALESCE(SUM(expense.amount), 0)', 'total')
        .where('DATE(expense.createdAt) = CURDATE()')
        .getRawOne<{ total: string }>(),
      this.saleRepository
        .createQueryBuilder('sale')
        .select('DATE(sale.saleDate)', 'date')
        .addSelect('COALESCE(SUM(sale.totalAmount), 0)', 'total')
        .where('sale.saleDate >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)')
        .groupBy('DATE(sale.saleDate)')
        .orderBy('DATE(sale.saleDate)', 'ASC')
        .getRawMany<{ date: string; total: string }>(),
      this.purchaseRepository
        .createQueryBuilder('purchase')
        .select('DATE(purchase.purchaseDate)', 'date')
        .addSelect('COALESCE(SUM(purchase.totalAmount), 0)', 'total')
        .where('purchase.purchaseDate >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)')
        .groupBy('DATE(purchase.purchaseDate)')
        .orderBy('DATE(purchase.purchaseDate)', 'ASC')
        .getRawMany<{ date: string; total: string }>(),
      this.expenseRepository
        .createQueryBuilder('expense')
        .select('DATE(expense.createdAt)', 'date')
        .addSelect('COALESCE(SUM(expense.amount), 0)', 'total')
        .where('expense.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)')
        .groupBy('DATE(expense.createdAt)')
        .orderBy('DATE(expense.createdAt)', 'ASC')
        .getRawMany<{ date: string; total: string }>(),
      this.missionRepository
        .createQueryBuilder('mission')
        .select('mission.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('mission.status')
        .getRawMany<{ status: MissionStatus; count: string }>(),
      this.saleRepository.find({
        relations: { customer: true },
        order: { saleDate: 'DESC' },
        take: 5,
      }),
      this.productRepository
        .createQueryBuilder('product')
        .leftJoin('product.stockMovements', 'sm')
        .leftJoin('product.baseUnit', 'baseUnit')
        .select('product.id', 'productId')
        .addSelect('product.name', 'productName')
        .addSelect('COALESCE(SUM(sm.quantity), 0)', 'quantity')
        .addSelect('baseUnit.symbol', 'baseUnitSymbol')
        .addSelect('product.minimumStock', 'minimumStock') // 👈 utile si tu veux le retourner
        .groupBy('product.id')
        .addGroupBy('product.name')
        .addGroupBy('baseUnit.symbol')
        .addGroupBy('product.minimumStock') // 👈 OBLIGATOIRE
        .having('COALESCE(SUM(sm.quantity), 0) <= product.minimumStock')
        .orderBy('quantity', 'ASC')
        .limit(20)
        .getRawMany<{
          productId: string;
          productName: string;
          quantity: string;
          baseUnitSymbol: string | null;
        }>(),
    ]);

    const salesTotal = Number(salesTotalRaw?.total ?? 0);
    const purchasesTotal = Number(purchasesTotalRaw?.total ?? 0);
    const expensesTotal = Number(expensesTotalRaw?.total ?? 0);
    const salesToday = Number(salesTodayRaw?.total ?? 0);
    const purchasesToday = Number(purchasesTodayRaw?.total ?? 0);
    const expensesToday = Number(expensesTodayRaw?.total ?? 0);

    const normalizedRecentSales: RecentSale[] = recentSales.map((sale) => ({
      id: sale.id,
      saleDate: sale.saleDate,
      totalAmount: Number(sale.totalAmount),
      customerName: sale.customer?.name ?? 'Client comptoir',
    }));

    const normalizedLowStock: LowStockItem[] = lowStock.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: Number(item.quantity),
      baseUnitSymbol: item.baseUnitSymbol,
    }));

    // MySQL DATE() peut retourner un objet Date ou une string selon le driver.
    // On normalise en string "YYYY-MM-DD" en timezone local pour correspondre à buildLastDays().
    const toDateString = (d: unknown): string => {
      if (d instanceof Date) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      return String(d).slice(0, 10);
    };

    const salesByDayMap = new Map(
      salesByDayRaw.map((item) => [
        toDateString(item.date),
        Number(item.total),
      ]),
    );
    const purchasesByDayMap = new Map(
      purchasesByDayRaw.map((item) => [
        toDateString(item.date),
        Number(item.total),
      ]),
    );
    const expensesByDayMap = new Map(
      expensesByDayRaw.map((item) => [
        toDateString(item.date),
        Number(item.total),
      ]),
    );

    const dailyTrend: DailyTrendItem[] = this.buildLastDays(7).map((date) => {
      const sales = salesByDayMap.get(date) ?? 0;
      const purchases = purchasesByDayMap.get(date) ?? 0;
      const expenses = expensesByDayMap.get(date) ?? 0;
      const gross = sales - purchases;
      const net = gross - expenses;

      return {
        date,
        sales,
        purchases,
        expenses,
        gross,
        net,
      };
    });

    const missionStatusCounts = {
      ongoing: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const row of missionStatusRaw) {
      if (row.status === MissionStatus.ONGOING) {
        missionStatusCounts.ongoing = Number(row.count);
      }
      if (row.status === MissionStatus.COMPLETED) {
        missionStatusCounts.completed = Number(row.count);
      }
      if (row.status === MissionStatus.CANCELLED) {
        missionStatusCounts.cancelled = Number(row.count);
      }
    }

    return {
      totalProducts,
      totalCustomers,
      ongoingMissions,
      salesTotal,
      purchasesTotal,
      expensesTotal,
      grossMarginTotal: salesTotal - purchasesTotal,
      netResultTotal: salesTotal - purchasesTotal - expensesTotal,
      salesToday,
      purchasesToday,
      expensesToday,
      grossMarginToday: salesToday - purchasesToday,
      netResultToday: salesToday - purchasesToday - expensesToday,
      dailyTrend,
      missionStatusCounts,
      recentSales: normalizedRecentSales,
      lowStock: normalizedLowStock,
    };
  }
}
