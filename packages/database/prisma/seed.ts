import { PrismaClient, UserRole, UserStatus, AudienceType } from '@prisma/client';
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
    const catId = categories[p.categorySlug];
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
