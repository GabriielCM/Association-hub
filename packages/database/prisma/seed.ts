import { PrismaClient, UserRole, UserStatus, AudienceType, ProductType, PaymentOptions } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TEST_USERS = [
  {
    email: 'admin@ahub.test',
    password: 'Admin@123',
    name: 'Administrador Teste',
    role: UserRole.ADMIN,
  },
  {
    email: 'membro@ahub.test',
    password: 'Membro@123',
    name: 'Membro Teste',
    role: UserRole.USER,
  },
  {
    email: 'teste@ahub.test',
    password: 'Teste@123',
    name: 'Usuario Teste',
    role: UserRole.USER,
  },
];

async function main() {
  console.log('🌱 Iniciando seed...\n');

  // 1. Criar associação demo
  const association = await prisma.association.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Associação Demo',
      slug: 'demo',
      pointsName: 'pontos',
      cashbackPercent: 5.0,
      stravaMaxKmDay: 5.0,
      primaryColor: '#8B5CF6',
      secondaryColor: '#06B6D4',
    },
  });
  console.log(`✅ Associação: ${association.name} (${association.id})`);

  // 2. Criar PointsConfig
  await prisma.pointsConfig.upsert({
    where: { associationId: association.id },
    update: {},
    create: {
      associationId: association.id,
      checkInPoints: 50,
      dailyPostPoints: 5,
      referralPoints: 500,
      stravaRunPointsPerKm: 10,
      stravaRidePointsPerKm: 5,
      stravaWalkPointsPerKm: 5,
      stravaSwimPointsPerKm: 15,
      stravaHikePointsPerKm: 8,
      stravaDailyLimitKm: 5.0,
      pointsToMoneyRate: 0.5,
    },
  });
  console.log('✅ PointsConfig criado');

  // 3. Criar usuários de teste
  console.log('\n👥 Criando usuários de teste...\n');

  for (const userData of TEST_USERS) {
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        passwordHash,
        name: userData.name,
        role: userData.role,
        status: UserStatus.ACTIVE,
      },
      create: {
        email: userData.email,
        passwordHash,
        name: userData.name,
        role: userData.role,
        status: UserStatus.ACTIVE,
        associationId: association.id,
      },
    });

    // Criar UserPoints se não existir
    await prisma.userPoints.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        balance: 1000,
        lifetimeEarned: 1000,
        lifetimeSpent: 0,
      },
    });

    console.log(`   ✅ ${user.email} (${user.role})`);
  }

  // 3.5. Criar plano de assinatura e vincular a um membro
  console.log('\n💎 Criando plano de assinatura...\n');

  const plan = await prisma.subscriptionPlan.upsert({
    where: { id: 'seed-plan-premium' },
    update: { name: 'Premium', priceMonthly: 4990 },
    create: {
      id: 'seed-plan-premium',
      associationId: association.id,
      name: 'Premium',
      description: 'Acesso completo com multiplicadores de pontos',
      priceMonthly: 4990,
      color: '#8B5CF6',
      pointsMultiplier: 1.5,
      storeDiscount: 10,
      pdvDiscount: 10,
      spaceDiscount: 15,
      mutators: {
        points_events: 1.5,
        points_strava: 1.5,
        points_posts: 2.0,
        discount_store: 10.0,
        discount_pdv: 10.0,
        discount_spaces: 15.0,
        cashback: 10.0,
      },
    },
  });
  console.log(`   ✅ Plano: ${plan.name} (R$ ${(plan.priceMonthly / 100).toFixed(2)}/mes)`);

  // Vincular membro ao plano
  const membroUser = await prisma.user.findUnique({ where: { email: 'membro@ahub.test' } });
  if (membroUser) {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.userSubscription.upsert({
      where: { userId: membroUser.id },
      update: { status: 'ACTIVE', planId: plan.id },
      create: {
        userId: membroUser.id,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
    console.log(`   ✅ ${membroUser.email} → ${plan.name} (ACTIVE)`);
  }

  // 4. Adicionar 500 pontos para todos os usuários
  console.log('\n💰 Adicionando 500 pontos para todos os usuários...\n');

  const allUsers = await prisma.user.findMany({ select: { id: true, email: true } });

  for (const user of allUsers) {
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: user.id },
    });

    if (!userPoints) continue;

    const newBalance = userPoints.balance + 500;

    await prisma.$transaction([
      prisma.userPoints.update({
        where: { userId: user.id },
        data: {
          balance: newBalance,
          lifetimeEarned: userPoints.lifetimeEarned + 500,
        },
      }),
      prisma.pointTransaction.create({
        data: {
          userId: user.id,
          amount: 500,
          balance: newBalance,
          source: 'ADMIN_CREDIT',
          description: 'Seed: bônus inicial de 500 pontos',
        },
      }),
    ]);

    console.log(`   ✅ ${user.email}: +500 pts (saldo: ${newBalance})`);
  }

  // 5. Criar categorias de parceiros
  console.log('\n🏷️  Criando categorias de parceiros...\n');

  const categoriesData = [
    { name: 'Alimentação', slug: 'alimentacao', icon: '🍽️', color: '#F97316', order: 1 },
    { name: 'Saúde', slug: 'saude', icon: '🏥', color: '#3B82F6', order: 2 },
    { name: 'Lazer & Entretenimento', slug: 'lazer', icon: '🎭', color: '#8B5CF6', order: 3 },
    { name: 'Educação', slug: 'educacao', icon: '🎓', color: '#22C55E', order: 4 },
    { name: 'Esportes & Fitness', slug: 'esportes', icon: '🏃', color: '#EF4444', order: 5 },
    { name: 'Varejo & Serviços', slug: 'varejo', icon: '🛒', color: '#EAB308', order: 6 },
    { name: 'Automotivo', slug: 'automotivo', icon: '🚗', color: '#6B7280', order: 7 },
    { name: 'Outros', slug: 'outros', icon: '💼', color: '#92400E', order: 8 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const category = await prisma.partnerCategory.upsert({
      where: { associationId_slug: { associationId: association.id, slug: cat.slug } },
      update: { name: cat.name, icon: cat.icon, color: cat.color, order: cat.order },
      create: {
        associationId: association.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
        order: cat.order,
      },
    });
    categories[cat.slug] = category.id;
    console.log(`   ✅ ${cat.icon} ${cat.name}`);
  }

  // 6. Criar parceiros mockados
  console.log('\n🤝 Criando parceiros...\n');

  const partnersData = [
    {
      name: 'Pizzaria Bella Napoli',
      categorySlug: 'alimentacao',
      benefit: '15% de desconto em todos os pratos',
      instructions: 'Apresente a carteirinha digital antes de fechar a conta.',
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      lat: -23.5505,
      lng: -46.6333,
      phone: '(11) 3456-7890',
      website: 'https://bellanapolisp.com.br',
      instagram: '@bellanapolisp',
      whatsapp: '(11) 91234-5678',
      businessHours: {
        monday: '11:00-23:00',
        tuesday: '11:00-23:00',
        wednesday: '11:00-23:00',
        thursday: '11:00-23:00',
        friday: '11:00-00:00',
        saturday: '11:00-00:00',
        sunday: '11:00-22:00',
      },
      eligibleAudiences: [AudienceType.ALL],
    },
    {
      name: 'Academia FitMax',
      categorySlug: 'esportes',
      benefit: '20% de desconto na mensalidade',
      instructions: 'Informe que é associado na recepção e apresente o QR Code.',
      street: 'Av. Paulista, 1500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      lat: -23.5631,
      lng: -46.6544,
      phone: '(11) 2345-6789',
      website: 'https://fitmaxacademia.com.br',
      instagram: '@fitmaxsp',
      businessHours: {
        monday: '06:00-23:00',
        tuesday: '06:00-23:00',
        wednesday: '06:00-23:00',
        thursday: '06:00-23:00',
        friday: '06:00-22:00',
        saturday: '08:00-18:00',
        sunday: '08:00-14:00',
      },
      eligibleAudiences: [AudienceType.SUBSCRIBERS],
    },
    {
      name: 'Clínica Sorriso',
      categorySlug: 'saude',
      benefit: '10% de desconto em consultas e procedimentos',
      instructions: 'Agende pelo WhatsApp mencionando a associação.',
      street: 'Rua Augusta, 890',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01304-001',
      lat: -23.5544,
      lng: -46.6600,
      phone: '(11) 3678-9012',
      whatsapp: '(11) 98765-4321',
      businessHours: {
        monday: '08:00-18:00',
        tuesday: '08:00-18:00',
        wednesday: '08:00-18:00',
        thursday: '08:00-18:00',
        friday: '08:00-17:00',
      },
      eligibleAudiences: [AudienceType.ALL],
    },
    {
      name: 'Livraria Cultura Viva',
      categorySlug: 'educacao',
      benefit: '15% de desconto em livros e cursos',
      instructions: 'Apresente sua carteirinha no caixa.',
      street: 'Rua Oscar Freire, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01426-001',
      lat: -23.5618,
      lng: -46.6713,
      phone: '(11) 4567-8901',
      website: 'https://culturaviva.com.br',
      instagram: '@culturavivabooks',
      facebook: 'culturavivabooks',
      businessHours: {
        monday: '09:00-21:00',
        tuesday: '09:00-21:00',
        wednesday: '09:00-21:00',
        thursday: '09:00-21:00',
        friday: '09:00-22:00',
        saturday: '10:00-20:00',
        sunday: '12:00-18:00',
      },
      eligibleAudiences: [AudienceType.ALL],
    },
    {
      name: 'Cinema Star',
      categorySlug: 'lazer',
      benefit: 'Ingresso com 30% de desconto (seg a qui)',
      instructions: 'Compre pelo app com código AHUB30 ou apresente a carteirinha na bilheteria.',
      street: 'Av. Rebouças, 3970',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05401-450',
      lat: -23.5700,
      lng: -46.6850,
      phone: '(11) 5678-9012',
      website: 'https://cinemastar.com.br',
      instagram: '@cinemastarsp',
      businessHours: {
        monday: '13:00-23:00',
        tuesday: '13:00-23:00',
        wednesday: '13:00-23:00',
        thursday: '13:00-23:00',
        friday: '13:00-01:00',
        saturday: '11:00-01:00',
        sunday: '11:00-23:00',
      },
      eligibleAudiences: [AudienceType.ALL],
    },
    {
      name: 'Auto Center Premium',
      categorySlug: 'automotivo',
      benefit: 'Troca de óleo com 25% de desconto',
      instructions: 'Agende pelo telefone e informe que é associado.',
      street: 'Rua Vergueiro, 2100',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04102-000',
      lat: -23.5880,
      lng: -46.6380,
      phone: '(11) 6789-0123',
      whatsapp: '(11) 97654-3210',
      businessHours: {
        monday: '08:00-18:00',
        tuesday: '08:00-18:00',
        wednesday: '08:00-18:00',
        thursday: '08:00-18:00',
        friday: '08:00-18:00',
        saturday: '08:00-13:00',
      },
      eligibleAudiences: [AudienceType.SUBSCRIBERS],
    },
    {
      name: 'Pet Shop Amigo Fiel',
      categorySlug: 'varejo',
      benefit: '10% em ração e acessórios',
      instructions: 'Válido apenas para compras acima de R$ 50. Apresente a carteirinha.',
      street: 'Rua Pamplona, 300',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01405-000',
      lat: -23.5660,
      lng: -46.6520,
      phone: '(11) 7890-1234',
      instagram: '@amigofielpetshop',
      businessHours: {
        monday: '09:00-19:00',
        tuesday: '09:00-19:00',
        wednesday: '09:00-19:00',
        thursday: '09:00-19:00',
        friday: '09:00-19:00',
        saturday: '09:00-17:00',
      },
      eligibleAudiences: [AudienceType.ALL],
    },
    {
      name: 'Restaurante Sabor da Terra',
      categorySlug: 'alimentacao',
      benefit: 'Almoço executivo por R$ 29,90 (preço especial)',
      instructions: 'Diga que é associado ao ser atendido. Válido de seg a sex no almoço.',
      street: 'Rua Haddock Lobo, 595',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01414-001',
      lat: -23.5590,
      lng: -46.6680,
      phone: '(11) 8901-2345',
      businessHours: {
        monday: '11:30-15:00',
        tuesday: '11:30-15:00',
        wednesday: '11:30-15:00',
        thursday: '11:30-15:00',
        friday: '11:30-15:00',
      },
      eligibleAudiences: [AudienceType.ALL],
    },
  ];

  for (const p of partnersData) {
    const catId = categories[p.categorySlug]!;
    await prisma.partner.upsert({
      where: {
        id: `seed-partner-${p.categorySlug}-${p.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}`,
      },
      update: {
        name: p.name,
        benefit: p.benefit,
        instructions: p.instructions,
        categoryId: catId,
      },
      create: {
        id: `seed-partner-${p.categorySlug}-${p.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}`,
        associationId: association.id,
        categoryId: catId,
        name: p.name,
        benefit: p.benefit,
        instructions: p.instructions,
        street: p.street,
        city: p.city,
        state: p.state,
        zipCode: p.zipCode,
        lat: p.lat,
        lng: p.lng,
        phone: p.phone || null,
        website: p.website || null,
        instagram: p.instagram || null,
        facebook: p.facebook || null,
        whatsapp: p.whatsapp || null,
        businessHours: p.businessHours || null,
        eligibleAudiences: p.eligibleAudiences,
        showLocked: true,
      },
    });
    console.log(`   ✅ ${p.name} (${p.categorySlug})`);
  }

  // 7. Criar categorias da loja
  console.log('\n🛒 Criando categorias da loja...\n');

  const storeCategoriesData = [
    { name: 'Vestuário', slug: 'vestuario', displayOrder: 1 },
    { name: 'Acessórios', slug: 'acessorios', displayOrder: 2 },
    { name: 'Suplementos', slug: 'suplementos', displayOrder: 3 },
    { name: 'Vouchers', slug: 'vouchers', displayOrder: 4 },
    { name: 'Brindes', slug: 'brindes', displayOrder: 5 },
  ];

  const storeCategories: Record<string, string> = {};
  for (const sc of storeCategoriesData) {
    const cat = await prisma.storeCategory.upsert({
      where: { associationId_slug: { associationId: association.id, slug: sc.slug } },
      update: { name: sc.name, displayOrder: sc.displayOrder },
      create: {
        associationId: association.id,
        name: sc.name,
        slug: sc.slug,
        displayOrder: sc.displayOrder,
      },
    });
    storeCategories[sc.slug] = cat.id;
    console.log(`   ✅ ${sc.name}`);
  }

  // 8. Criar produtos da loja
  console.log('\n📦 Criando produtos da loja...\n');

  const productsData = [
    {
      id: 'seed-prod-camiseta',
      slug: 'camiseta-oficial',
      name: 'Camiseta Oficial',
      shortDescription: 'Camiseta oficial da associação em algodão premium',
      longDescription: 'Camiseta oficial da Associação Demo, confeccionada em algodão 100% penteado, com estampa serigrafada de alta qualidade. Disponível em vários tamanhos.',
      categorySlug: 'vestuario',
      type: ProductType.PHYSICAL,
      pricePoints: 500,
      priceMoney: 49.90,
      paymentOptions: PaymentOptions.BOTH,
      stockType: 'limited',
      stockCount: 100,
      limitPerUser: 5,
      cashbackPercent: 5.0,
      isFeatured: true,
      isPromotional: false,
      averageRating: 4.7,
      reviewCount: 23,
      soldCount: 85,
      pickupLocation: 'Sede da Associação - Recepção',
    },
    {
      id: 'seed-prod-bone',
      slug: 'bone-bordado',
      name: 'Boné Bordado',
      shortDescription: 'Boné com logo bordado, ajuste snapback',
      categorySlug: 'acessorios',
      type: ProductType.PHYSICAL,
      pricePoints: 300,
      priceMoney: 29.90,
      paymentOptions: PaymentOptions.BOTH,
      stockType: 'limited',
      stockCount: 60,
      limitPerUser: 3,
      cashbackPercent: 5.0,
      isFeatured: true,
      averageRating: 4.5,
      reviewCount: 12,
      soldCount: 45,
    },
    {
      id: 'seed-prod-whey',
      slug: 'whey-protein-900g',
      name: 'Whey Protein 900g',
      shortDescription: 'Whey concentrado sabor chocolate, 900g',
      longDescription: 'Whey Protein Concentrado com 24g de proteína por dose. Sabor chocolate. Ideal para recuperação muscular pós-treino.',
      categorySlug: 'suplementos',
      type: ProductType.PHYSICAL,
      pricePoints: 1200,
      priceMoney: 119.90,
      paymentOptions: PaymentOptions.BOTH,
      stockType: 'limited',
      stockCount: 30,
      limitPerUser: 2,
      cashbackPercent: 5.0,
      averageRating: 4.8,
      reviewCount: 31,
      soldCount: 120,
    },
    {
      id: 'seed-prod-creatina',
      slug: 'creatina-300g',
      name: 'Creatina 300g',
      shortDescription: 'Creatina monoidratada pura, 300g',
      categorySlug: 'suplementos',
      type: ProductType.PHYSICAL,
      pricePoints: 600,
      priceMoney: 59.90,
      paymentOptions: PaymentOptions.BOTH,
      stockType: 'limited',
      stockCount: 40,
      cashbackPercent: 5.0,
      isPromotional: true,
      promotionalPricePoints: 450,
      promotionalPriceMoney: 44.90,
      promotionalEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      averageRating: 4.6,
      reviewCount: 18,
      soldCount: 75,
    },
    {
      id: 'seed-prod-garrafa',
      slug: 'garrafa-termica',
      name: 'Garrafa Térmica',
      shortDescription: 'Garrafa inox 750ml, mantém temperatura por 12h',
      categorySlug: 'acessorios',
      type: ProductType.PHYSICAL,
      pricePoints: 400,
      priceMoney: 39.90,
      paymentOptions: PaymentOptions.BOTH,
      stockType: 'limited',
      stockCount: 50,
      limitPerUser: 3,
      cashbackPercent: 5.0,
      isFeatured: true,
      averageRating: 4.9,
      reviewCount: 8,
      soldCount: 35,
    },
    {
      id: 'seed-prod-voucher-restaurante',
      slug: 'voucher-restaurante',
      name: 'Voucher Restaurante',
      shortDescription: 'Vale-refeição de R$ 30 nos parceiros',
      categorySlug: 'vouchers',
      type: ProductType.VOUCHER,
      pricePoints: 200,
      priceMoney: 19.90,
      paymentOptions: PaymentOptions.BOTH,
      stockType: 'unlimited',
      voucherValidityDays: 30,
      cashbackPercent: 0,
      soldCount: 200,
    },
    {
      id: 'seed-prod-voucher-cinema',
      slug: 'voucher-cinema',
      name: 'Voucher Cinema',
      shortDescription: 'Ingresso de cinema válido em qualquer sessão',
      categorySlug: 'vouchers',
      type: ProductType.VOUCHER,
      pricePoints: 350,
      priceMoney: null,
      paymentOptions: PaymentOptions.POINTS_ONLY,
      stockType: 'unlimited',
      voucherValidityDays: 30,
      cashbackPercent: 0,
      soldCount: 150,
    },
    {
      id: 'seed-prod-adesivo',
      slug: 'adesivo-logo',
      name: 'Adesivo Logo',
      shortDescription: 'Adesivo vinil com logo da associação',
      categorySlug: 'brindes',
      type: ProductType.PHYSICAL,
      pricePoints: 50,
      priceMoney: null,
      paymentOptions: PaymentOptions.POINTS_ONLY,
      stockType: 'limited',
      stockCount: 200,
      cashbackPercent: 0,
      soldCount: 180,
    },
    {
      id: 'seed-prod-chaveiro',
      slug: 'chaveiro-metal',
      name: 'Chaveiro Metal',
      shortDescription: 'Chaveiro em metal com acabamento premium',
      categorySlug: 'brindes',
      type: ProductType.PHYSICAL,
      pricePoints: 100,
      priceMoney: 9.90,
      paymentOptions: PaymentOptions.BOTH,
      stockType: 'limited',
      stockCount: 80,
      cashbackPercent: 5.0,
      soldCount: 60,
    },
    {
      id: 'seed-prod-regata',
      slug: 'regata-treino',
      name: 'Regata Treino',
      shortDescription: 'Regata dry-fit para treinos, leve e respirável',
      categorySlug: 'vestuario',
      type: ProductType.PHYSICAL,
      pricePoints: 400,
      priceMoney: 39.90,
      paymentOptions: PaymentOptions.BOTH,
      stockType: 'limited',
      stockCount: 70,
      limitPerUser: 5,
      cashbackPercent: 5.0,
      isPromotional: true,
      promotionalPricePoints: 300,
      promotionalPriceMoney: 29.90,
      promotionalEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
      averageRating: 4.4,
      reviewCount: 9,
      soldCount: 55,
    },
    {
      id: 'seed-prod-meia',
      slug: 'meia-esportiva-3-pares',
      name: 'Meia Esportiva (3 pares)',
      shortDescription: 'Kit com 3 pares de meias esportivas cano médio',
      categorySlug: 'vestuario',
      type: ProductType.PHYSICAL,
      pricePoints: 150,
      priceMoney: 14.90,
      paymentOptions: PaymentOptions.BOTH,
      stockType: 'limited',
      stockCount: 90,
      cashbackPercent: 5.0,
      soldCount: 40,
    },
    {
      id: 'seed-prod-toalha',
      slug: 'toalha-microfibra',
      name: 'Toalha Microfibra',
      shortDescription: 'Toalha de secagem rápida para academia',
      categorySlug: 'acessorios',
      type: ProductType.PHYSICAL,
      pricePoints: null,
      priceMoney: 24.90,
      paymentOptions: PaymentOptions.MONEY_ONLY,
      stockType: 'limited',
      stockCount: 45,
      cashbackPercent: 5.0,
      averageRating: 4.3,
      reviewCount: 5,
      soldCount: 25,
    },
  ];

  const productIds: Record<string, string> = {};
  for (const p of productsData) {
    const catId = storeCategories[p.categorySlug]!;
    const product = await prisma.storeProduct.upsert({
      where: { id: p.id },
      update: { name: p.name, pricePoints: p.pricePoints, priceMoney: p.priceMoney },
      create: {
        id: p.id,
        categoryId: catId,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        longDescription: p.longDescription || null,
        type: p.type,
        pricePoints: p.pricePoints,
        priceMoney: p.priceMoney,
        paymentOptions: p.paymentOptions,
        allowMixedPayment: p.paymentOptions === PaymentOptions.BOTH,
        stockType: p.stockType,
        stockCount: p.stockCount || null,
        limitPerUser: p.limitPerUser || null,
        cashbackPercent: p.cashbackPercent || null,
        voucherValidityDays: p.voucherValidityDays || null,
        isFeatured: p.isFeatured || false,
        isPromotional: p.isPromotional || false,
        promotionalPricePoints: p.promotionalPricePoints || null,
        promotionalPriceMoney: p.promotionalPriceMoney || null,
        promotionalEndsAt: p.promotionalEndsAt || null,
        averageRating: p.averageRating || null,
        reviewCount: p.reviewCount || 0,
        soldCount: p.soldCount || 0,
        pickupLocation: p.pickupLocation || null,
      },
    });
    productIds[p.slug] = product.id;
    console.log(`   ✅ ${p.name} (${p.pricePoints ? p.pricePoints + ' pts' : ''}${p.pricePoints && p.priceMoney ? ' / ' : ''}${p.priceMoney ? 'R$ ' + Number(p.priceMoney).toFixed(2) : ''})`);
  }

  // 9. Criar imagens dos produtos
  console.log('\n🖼️  Criando imagens dos produtos...\n');

  const imagesData = [
    { productSlug: 'camiseta-oficial', images: [
      { url: 'https://placehold.co/600x600/8B5CF6/FFFFFF?text=Camiseta+Frente', altText: 'Camiseta Oficial - Frente', displayOrder: 0 },
      { url: 'https://placehold.co/600x600/7C3AED/FFFFFF?text=Camiseta+Costas', altText: 'Camiseta Oficial - Costas', displayOrder: 1 },
    ]},
    { productSlug: 'bone-bordado', images: [
      { url: 'https://placehold.co/600x600/1F2937/FFFFFF?text=Bone+Bordado', altText: 'Boné Bordado', displayOrder: 0 },
    ]},
    { productSlug: 'whey-protein-900g', images: [
      { url: 'https://placehold.co/600x600/92400E/FFFFFF?text=Whey+Protein', altText: 'Whey Protein 900g', displayOrder: 0 },
      { url: 'https://placehold.co/600x600/78350F/FFFFFF?text=Whey+Tabela', altText: 'Whey Protein - Tabela Nutricional', displayOrder: 1 },
    ]},
    { productSlug: 'creatina-300g', images: [
      { url: 'https://placehold.co/600x600/3B82F6/FFFFFF?text=Creatina', altText: 'Creatina 300g', displayOrder: 0 },
    ]},
    { productSlug: 'garrafa-termica', images: [
      { url: 'https://placehold.co/600x600/6B7280/FFFFFF?text=Garrafa+Termica', altText: 'Garrafa Térmica 750ml', displayOrder: 0 },
    ]},
    { productSlug: 'voucher-restaurante', images: [
      { url: 'https://placehold.co/600x600/F97316/FFFFFF?text=Voucher+Restaurante', altText: 'Voucher Restaurante', displayOrder: 0 },
    ]},
    { productSlug: 'voucher-cinema', images: [
      { url: 'https://placehold.co/600x600/EF4444/FFFFFF?text=Voucher+Cinema', altText: 'Voucher Cinema', displayOrder: 0 },
    ]},
    { productSlug: 'adesivo-logo', images: [
      { url: 'https://placehold.co/600x600/22C55E/FFFFFF?text=Adesivo+Logo', altText: 'Adesivo Logo', displayOrder: 0 },
    ]},
    { productSlug: 'chaveiro-metal', images: [
      { url: 'https://placehold.co/600x600/EAB308/FFFFFF?text=Chaveiro+Metal', altText: 'Chaveiro Metal', displayOrder: 0 },
    ]},
    { productSlug: 'regata-treino', images: [
      { url: 'https://placehold.co/600x600/06B6D4/FFFFFF?text=Regata+Treino', altText: 'Regata Treino', displayOrder: 0 },
    ]},
    { productSlug: 'meia-esportiva-3-pares', images: [
      { url: 'https://placehold.co/600x600/9CA3AF/FFFFFF?text=Meia+Esportiva', altText: 'Meia Esportiva 3 pares', displayOrder: 0 },
    ]},
    { productSlug: 'toalha-microfibra', images: [
      { url: 'https://placehold.co/600x600/14B8A6/FFFFFF?text=Toalha+Microfibra', altText: 'Toalha Microfibra', displayOrder: 0 },
    ]},
  ];

  for (const item of imagesData) {
    const pid = productIds[item.productSlug]!;
    // Delete existing seed images to avoid duplicates on re-run
    await prisma.productImage.deleteMany({ where: { productId: pid } });
    for (const img of item.images) {
      await prisma.productImage.create({
        data: {
          productId: pid,
          url: img.url,
          altText: img.altText,
          displayOrder: img.displayOrder,
        },
      });
    }
  }
  console.log(`   ✅ ${imagesData.reduce((sum, i) => sum + i.images.length, 0)} imagens criadas`);

  // 10. Criar variantes de vestuário
  console.log('\n👕 Criando variantes de produtos...\n');

  const variantsData = [
    { productSlug: 'camiseta-oficial', variants: [
      { sku: 'CAM-OF-P', name: 'P', attributes: { size: 'P' }, stockCount: 25 },
      { sku: 'CAM-OF-M', name: 'M', attributes: { size: 'M' }, stockCount: 30 },
      { sku: 'CAM-OF-G', name: 'G', attributes: { size: 'G' }, stockCount: 25 },
      { sku: 'CAM-OF-GG', name: 'GG', attributes: { size: 'GG' }, stockCount: 20 },
    ]},
    { productSlug: 'regata-treino', variants: [
      { sku: 'REG-TR-P', name: 'P', attributes: { size: 'P' }, stockCount: 25 },
      { sku: 'REG-TR-M', name: 'M', attributes: { size: 'M' }, stockCount: 25 },
      { sku: 'REG-TR-G', name: 'G', attributes: { size: 'G' }, stockCount: 20 },
    ]},
  ];

  for (const item of variantsData) {
    const pid = productIds[item.productSlug]!;
    for (const v of item.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: { name: v.name, stockCount: v.stockCount },
        create: {
          productId: pid,
          sku: v.sku,
          name: v.name,
          attributes: v.attributes,
          stockCount: v.stockCount,
        },
      });
    }
    console.log(`   ✅ ${item.productSlug}: ${item.variants.length} variantes`);
  }

  // 11. Criar especificações de produtos
  console.log('\n📋 Criando especificações de produtos...\n');

  const specsData = [
    { productSlug: 'whey-protein-900g', specs: [
      { key: 'Tipo', value: 'Whey Concentrado', displayOrder: 0 },
      { key: 'Peso', value: '900g', displayOrder: 1 },
      { key: 'Sabor', value: 'Chocolate', displayOrder: 2 },
      { key: 'Proteína por dose', value: '24g', displayOrder: 3 },
    ]},
    { productSlug: 'creatina-300g', specs: [
      { key: 'Tipo', value: 'Monoidratada', displayOrder: 0 },
      { key: 'Peso', value: '300g', displayOrder: 1 },
      { key: 'Doses', value: '60 doses de 5g', displayOrder: 2 },
    ]},
    { productSlug: 'garrafa-termica', specs: [
      { key: 'Material', value: 'Aço Inox 304', displayOrder: 0 },
      { key: 'Capacidade', value: '750ml', displayOrder: 1 },
      { key: 'Isolamento', value: '12h quente / 24h frio', displayOrder: 2 },
    ]},
    { productSlug: 'camiseta-oficial', specs: [
      { key: 'Material', value: '100% Algodão Penteado', displayOrder: 0 },
      { key: 'Gramatura', value: '160g/m²', displayOrder: 1 },
      { key: 'Estampa', value: 'Serigrafia', displayOrder: 2 },
    ]},
  ];

  for (const item of specsData) {
    const pid = productIds[item.productSlug]!;
    await prisma.productSpecification.deleteMany({ where: { productId: pid } });
    for (const spec of item.specs) {
      await prisma.productSpecification.create({
        data: {
          productId: pid,
          key: spec.key,
          value: spec.value,
          displayOrder: spec.displayOrder,
        },
      });
    }
    console.log(`   ✅ ${item.productSlug}: ${item.specs.length} specs`);
  }

  console.log('\n🎉 Seed concluído!\n');
  console.log('📋 Credenciais de teste:');
  console.log('   ┌─────────────────────┬─────────────┬───────┐');
  console.log('   │ Email               │ Senha       │ Role  │');
  console.log('   ├─────────────────────┼─────────────┼───────┤');
  for (const u of TEST_USERS) {
    console.log(`   │ ${u.email.padEnd(19)} │ ${u.password.padEnd(11)} │ ${u.role.padEnd(5)} │`);
  }
  console.log('   └─────────────────────┴─────────────┴───────┘');
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
