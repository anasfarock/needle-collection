import { PrismaClient } from '@prisma/client';
import {
  initialProducts,
  initialCustomers,
  initialOrders,
  defaultBlocks,
  defaultBanners,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_NAME,
} from '../src/server/initialData';
import { hashPassword } from '../src/server/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Needle Collection database...');

  // 1. Seed default Admin User
  await prisma.adminUser.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL.toLowerCase() },
    update: {},
    create: {
      email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
      name: DEFAULT_ADMIN_NAME,
      role: 'Owner',
      passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    },
  });
  console.log(`✔ Seeded admin user: ${DEFAULT_ADMIN_EMAIL}`);

  // 2. Seed Products
  for (const p of initialProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle,
        description: p.description,
        category: p.category,
        subcategory: p.subcategory,
        fabric: p.fabric,
        season: p.season,
        status: p.status,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        images: p.images as any,
        colors: p.colors as any,
        sizes: p.sizes as any,
        stock: p.stock,
        isNew: Boolean(p.isNew),
        isSale: Boolean(p.isSale),
        publishedAt: p.publishedAt ?? new Date().toISOString().split('T')[0],
      },
    });
  }
  console.log(`✔ Seeded ${initialProducts.length} products`);

  // 3. Seed Customers
  for (const c of initialCustomers) {
    await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email ?? null,
        city: c.city ?? null,
        totalOrders: c.totalOrders,
        totalSpent: c.totalSpent,
        lastOrderAt: c.lastOrderAt ?? null,
      },
    });
  }
  console.log(`✔ Seeded ${initialCustomers.length} customers`);

  // 4. Seed Orders
  for (const o of initialOrders) {
    await prisma.order.upsert({
      where: { orderNumber: o.orderNumber },
      update: {},
      create: {
        id: o.id,
        orderNumber: o.orderNumber,
        customerId: o.customer.id,
        items: o.items as any,
        subtotal: o.subtotal,
        discount: o.discount,
        shipping: o.shipping,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        shippingAddress: o.shippingAddress as any,
        notes: o.notes ?? null,
        createdAt: new Date(o.createdAt),
      },
    });
  }
  console.log(`✔ Seeded ${initialOrders.length} orders`);

  // 5. Seed Site Content
  await prisma.siteContent.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      blocks: defaultBlocks as any,
      banners: defaultBanners as any,
    },
  });
  console.log('✔ Seeded default site content');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

