import { hash } from 'bcryptjs';
import { AppDataSource } from 'src/config/ormconfig';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import { ExpenseCategory } from 'src/modules/expense-category/entities/expense-category.entity';
import {
  Mission,
  MissionStatus,
} from 'src/modules/mission/entities/mission.entity';
import { PaymentMethod } from 'src/modules/payment-methods/entities/payment-method.entity';
import { ProductUnit } from 'src/modules/product-units/entities/product-unit.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Supplier } from 'src/modules/suppliers/entities/supplier.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';
import { User, UserRole } from 'src/modules/users/entities/user.entity';

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected.');

  // --- Units ---
  const unitRepo = AppDataSource.getRepository(Unit);
  const unitsData = [
    { name: 'Kilogramme', symbol: 'kg' },
    { name: 'Gramme', symbol: 'g' },
    { name: 'Milligramme', symbol: 'mg' },
    { name: 'Tonne', symbol: 't' },

    { name: 'Litre', symbol: 'L' },
    { name: 'Millilitre', symbol: 'mL' },
    { name: 'Centilitre', symbol: 'cL' },
    { name: 'Kilolitre', symbol: 'kL' },
    { name: 'Gallon', symbol: 'gal' },
    { name: 'Once liquide', symbol: 'oz' },
    { name: 'Mètre cube', symbol: 'm³' },

    { name: 'Mètre', symbol: 'm' },
    { name: 'Centimètre', symbol: 'cm' },
    { name: 'Mètre linéaire', symbol: 'ml' },
    { name: 'Yard', symbol: 'yd' },
    { name: 'Pied', symbol: 'ft' },
    { name: 'Pouce', symbol: 'in' },
    { name: 'Mètre carré', symbol: 'm²' },

    { name: 'Pièce', symbol: 'pcs' },
    { name: 'Unité', symbol: 'u' },
    { name: 'Lot', symbol: 'lot' },
    { name: 'Set', symbol: 'set' },
    { name: 'Kit', symbol: 'kit' },
    { name: 'Douzaine', symbol: 'dz' },

    { name: 'Carton', symbol: 'ctn' },
    { name: 'Sac', symbol: 'sac' },
    { name: 'Bouteille', symbol: 'btl' },
    { name: 'Paquet', symbol: 'pkt' },
    { name: 'Pack', symbol: 'pk' },
    { name: 'Sachet', symbol: 'sht' },
    { name: 'Bidon', symbol: 'bdn' },
    { name: 'Caisse', symbol: 'cse' },
    { name: 'Boîte', symbol: 'box' },
    { name: 'Pot', symbol: 'pot' },
    { name: 'Canette', symbol: 'can' },
    { name: 'Flacon', symbol: 'flc' },
    { name: 'Tube', symbol: 'tub' },
    { name: 'Rouleau', symbol: 'rle' },
    { name: 'Palette', symbol: 'pal' },
    { name: 'Baril', symbol: 'brl' },
    { name: 'Fût', symbol: 'fut' },
    { name: 'Tonneau', symbol: 'tnx' },

    { name: 'Tranche', symbol: 'tr' },
    { name: 'Morceau', symbol: 'mrc' },
    { name: 'Portion', symbol: 'prt' },
    { name: 'Barquette', symbol: 'bqt' },
    { name: 'Plateau', symbol: 'plt' },

    { name: 'Cuillère à soupe', symbol: 'càs' },
    { name: 'Cuillère à café', symbol: 'càc' },
  ];
  const units: Unit[] = [];
  for (const data of unitsData) {
    const existing = await unitRepo.findOne({ where: { symbol: data.symbol } });
    units.push(existing ?? (await unitRepo.save(unitRepo.create(data))));
  }
  console.log(`✔ ${units.length} units seeded.`);

  // --- Users ---
  const userRepo = AppDataSource.getRepository(User);
  const usersData = [
    {
      username: 'admin',
      email: 'admin@bizina.com',
      password: await hash('admin123', 10),
      role: UserRole.ADMIN,
      isActive: true,
    },
    {
      username: 'manager',
      email: 'manager@bizina.com',
      password: await hash('manager123', 10),
      role: UserRole.MANAGER,
      isActive: true,
    },
    {
      username: 'caissier',
      email: 'caissier@bizina.com',
      password: await hash('caissier123', 10),
      role: UserRole.CASHIER,
      isActive: true,
    },
  ];
  let usersCount = 0;
  for (const data of usersData) {
    const existing = await userRepo.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });
    if (!existing) {
      await userRepo.save(userRepo.create(data));
      usersCount++;
    }
  }
  console.log(`✔ ${usersCount} users seeded.`);

  // --- Customers ---
  const customerRepo = AppDataSource.getRepository(Customer);
  const customersData = [
    { name: 'Client Comptoir', phone: null, address: null },
    {
      name: 'Jean Mukendi',
      phone: '+243 812 345 678',
      address: 'Av. Lumumba 12, Lubumbashi',
    },
    {
      name: 'Marie Kabila',
      phone: '+243 991 234 567',
      address: 'Av. Kasavubu 45, Kinshasa',
    },
    {
      name: 'Restaurant Le Bon Goût',
      phone: '+243 850 000 111',
      address: 'Quartier Commercial, Goma',
    },
    {
      name: 'Boutique Étoile',
      phone: '+243 870 222 333',
      address: 'Av. du Marché 8, Bukavu',
    },
  ];
  let customersCount = 0;
  for (const data of customersData) {
    const existing = await customerRepo.findOne({
      where: { name: data.name },
    });
    if (!existing) {
      await customerRepo.save(customerRepo.create(data));
      customersCount++;
    }
  }
  console.log(`✔ ${customersCount} customers seeded.`);

  // --- Suppliers ---
  const supplierRepo = AppDataSource.getRepository(Supplier);
  const suppliersData = [
    {
      name: 'Bralima SARL',
      phone: '+243 810 000 001',
      address: 'Zone Industrielle, Kinshasa',
    },
    {
      name: 'Minoterie du Congo',
      phone: '+243 820 000 002',
      address: 'Av. Industrielle, Lubumbashi',
    },
    {
      name: 'Import Express',
      phone: '+243 990 000 003',
      address: 'Port de Matadi',
    },
    {
      name: 'Ferme Verte',
      phone: '+243 850 000 004',
      address: 'Route Nationale 1, Kikwit',
    },
  ];
  let suppliersCount = 0;
  for (const data of suppliersData) {
    const existing = await supplierRepo.findOne({
      where: { name: data.name },
    });
    if (!existing) {
      await supplierRepo.save(supplierRepo.create(data));
      suppliersCount++;
    }
  }
  console.log(`✔ ${suppliersCount} suppliers seeded.`);

  // --- Payment Methods ---
  const pmRepo = AppDataSource.getRepository(PaymentMethod);
  const pmData = [
    { name: 'Espèces' },
    { name: 'Mobile Money' },
    { name: 'Virement bancaire' },
    { name: 'Carte bancaire' },
    { name: 'Crédit' },
  ];
  let pmCount = 0;
  for (const data of pmData) {
    const existing = await pmRepo.findOne({ where: { name: data.name } });
    if (!existing) {
      await pmRepo.save(pmRepo.create(data));
      pmCount++;
    }
  }
  console.log(`✔ ${pmCount} payment methods seeded.`);

  // --- Expense Categories ---
  const ecRepo = AppDataSource.getRepository(ExpenseCategory);
  const ecData = [
    { name: 'Carburant', description: 'Essence, diesel, transports' },
    { name: 'Personnel', description: 'Salaires, commissions' },
    { name: 'Fournitures', description: 'Matériel de bureau, emballages' },
    { name: 'Transport', description: 'Frais de déplacement, livraison' },
    { name: 'Maintenance', description: 'Réparations, entretien' },
    { name: 'Divers', description: 'Autres dépenses' },
  ];
  let ecCount = 0;
  for (const data of ecData) {
    const existing = await ecRepo.findOne({ where: { name: data.name } });
    if (!existing) {
      await ecRepo.save(ecRepo.create(data));
      ecCount++;
    }
  }
  console.log(`✔ ${ecCount} expense categories seeded.`);

  // --- Missions ---
  const missionRepo = AppDataSource.getRepository(Mission);
  const manager = await AppDataSource.getRepository(User).findOne({
    where: { username: 'manager' },
  });

  if (!manager) {
    console.warn('⚠️  Manager user not found, skipping missions seed');
  } else {
    const missionsData = [
      {
        title: 'Achat riz auprès de Bralima - Avril 2026',
        assignedTo: manager,
        initialCash: 2000,
        status: MissionStatus.ONGOING,
      },
    ];
    let missionsCount = 0;
    for (const data of missionsData) {
      const existing = await missionRepo.findOne({
        where: { title: data.title },
      });
      if (!existing) {
        await missionRepo.save(missionRepo.create(data));
        missionsCount++;
      }
    }
    console.log(`✔ ${missionsCount} missions seeded.`);
  }

  // --- Products ---
  const productRepo = AppDataSource.getRepository(Product);
  const kg = units.find((u) => u.symbol === 'kg')!;
  const litre = units.find((u) => u.symbol === 'L')!;
  const piece = units.find((u) => u.symbol === 'pcs')!;
  const sac = units.find((u) => u.symbol === 'sac')!;

  const productsData = [
    { name: 'Riz', description: 'Riz blanc importé 5%', baseUnit: kg },
    { name: 'Farine de blé', description: 'Farine de blé T55', baseUnit: kg },
    {
      name: 'Huile de palme',
      description: 'Huile de palme raffinée',
      baseUnit: litre,
    },
    { name: 'Sucre', description: 'Sucre blanc cristallisé', baseUnit: kg },
    { name: 'Sel', description: 'Sel de cuisine iodé', baseUnit: kg },
    { name: 'Savon', description: 'Savon de ménage 200g', baseUnit: piece },
    {
      name: 'Ciment',
      description: 'Ciment Portland CEM II 50kg',
      baseUnit: sac,
    },
    { name: 'Eau minérale', description: 'Eau minérale 1.5L', baseUnit: piece },
  ];
  const products: Product[] = [];
  for (const data of productsData) {
    const existing = await productRepo.findOne({
      where: { name: data.name },
    });
    products.push(
      existing ?? (await productRepo.save(productRepo.create(data))),
    );
  }
  console.log(`✔ ${products.length} products seeded.`);

  // --- Product Units ---
  const puRepo = AppDataSource.getRepository(ProductUnit);
  const g = units.find((u) => u.symbol === 'g')!;
  const ml = units.find((u) => u.symbol === 'mL')!;
  const carton = units.find((u) => u.symbol === 'ctn')!;

  const productUnitsData = [
    // Riz: kg (base), sac 25kg, sac 50kg
    { product: products[0], unit: kg, conversionToBase: '1' },
    { product: products[0], unit: sac, conversionToBase: '25' },
    // Farine: kg (base), sac 50kg
    { product: products[1], unit: kg, conversionToBase: '1' },
    { product: products[1], unit: sac, conversionToBase: '50' },
    // Huile: L (base), mL
    { product: products[2], unit: litre, conversionToBase: '1' },
    { product: products[2], unit: ml, conversionToBase: '0.001' },
    // Sucre: kg (base), g
    { product: products[3], unit: kg, conversionToBase: '1' },
    { product: products[3], unit: g, conversionToBase: '0.001' },
    // Sel: kg (base)
    { product: products[4], unit: kg, conversionToBase: '1' },
    // Savon: pcs (base), carton 48pcs
    { product: products[5], unit: piece, conversionToBase: '1' },
    { product: products[5], unit: carton, conversionToBase: '48' },
    // Ciment: sac (base)
    { product: products[6], unit: sac, conversionToBase: '1' },
    // Eau: pcs (base), carton 12pcs
    { product: products[7], unit: piece, conversionToBase: '1' },
    { product: products[7], unit: carton, conversionToBase: '12' },
  ];
  let puCount = 0;
  for (const data of productUnitsData) {
    const existing = await puRepo.findOne({
      where: { product: { id: data.product.id }, unit: { id: data.unit.id } },
    });
    if (!existing) {
      await puRepo.save(puRepo.create(data));
      puCount++;
    }
  }
  console.log(`✔ ${puCount} product units seeded.`);

  console.log('\n🎉 Seed completed!');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
