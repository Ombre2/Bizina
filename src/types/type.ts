import { Mission } from 'src/modules/mission/entities/mission.entity';
import { PurchaseItem } from 'src/modules/purchase-item/entities/purchase-item.entity';
import { Purchase } from 'src/modules/purchase/entities/purchase.entity';
import { SaleItem } from 'src/modules/sale-items/entities/sale-item.entity';
import { Sale } from 'src/modules/sales/entities/sale.entity';

export type MissionWithTotals = Omit<Mission, 'purchases' | 'sales'> & {
  totalPurchases: number;
  totalSales: number;
  remainingCash: number;
  totalExpenses: number;
};

export type SaleWithItemsResponseDto = {
  sale: Sale;
  saleItems: SaleItem[];
};

export type PurchaseWithItemsResponseDto = {
  purchase: Purchase;
  purchaseItems: PurchaseItem[];
};
