import {
  PrismaClient,
  UserRole,
  UserStatus,
  AudienceType,
  ProductType,
  PaymentOptions,
  EventCategory,
  EventStatus,
  ConversationType,
  ConversationRole,
  MessageContentType,
  MessageStatus,
  NotificationCategory,
  NotificationType,
  CardStatus,
  OrderSource,
  OrderStatus,
  OrderPaymentMethod,
  OrderItemType,
  BookingPeriodType,
  BookingStatus,
  SpaceStatus,
  PdvStatus,
  TicketCategory,
  TicketStatus,
  SenderType,
  StoryType,
  PostType,
  ReviewStatus,
  EventCommentContentType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// =============================================
// HELPERS
// =============================================

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function randomCode(len: number): string {
  return crypto.randomBytes(len).toString('hex').slice(0, len).toUpperCase();
}

// =============================================
// TEST USERS
// =============================================

const TEST_USERS = [
  { email: 'admin@ahub.test', password: 'Admin@123', name: 'Administrador Demo', username: 'admin', role: UserRole.ADMIN },
  { email: 'membro@ahub.test', password: 'Membro@123', name: 'João Silva', username: 'joaosilva', role: UserRole.USER },
  { email: 'teste@ahub.test', password: 'Teste@123', name: 'Maria Santos', username: 'mariasantos', role: UserRole.USER },
  { email: 'ana@ahub.test', password: 'Teste@123', name: 'Ana Oliveira', username: 'anaoliveira', role: UserRole.USER },
  { email: 'pedro@ahub.test', password: 'Teste@123', name: 'Pedro Costa', username: 'pedrocosta', role: UserRole.USER },
  { email: 'lucas@ahub.test', password: 'Teste@123', name: 'Lucas Ferreira', username: 'lucasferreira', role: UserRole.USER },
  { email: 'julia@ahub.test', password: 'Teste@123', name: 'Julia Mendes', username: 'juliamendes', role: UserRole.USER },
  { email: 'rafael@ahub.test', password: 'Teste@123', name: 'Rafael Lima', username: 'rafaellima', role: UserRole.USER },
  { email: 'camila@ahub.test', password: 'Teste@123', name: 'Camila Souza', username: 'camilasouza', role: UserRole.USER },
  { email: 'bruno@ahub.test', password: 'Teste@123', name: 'Bruno Almeida', username: 'brunoalmeida', role: UserRole.USER },
];

// =============================================
// MAIN SEED
// =============================================

async function main() {
  console.log('🌱 Iniciando seed completo...\n');

  // ─── 1. Association + PointsConfig ─────────────────────
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
  console.log(`✅ Associação: ${association.name}`);

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
  console.log('✅ PointsConfig');

  // ─── 2. Users ──────────────────────────────────────────
  console.log('\n👥 Criando usuários...\n');

  const users: Record<string, string> = {};

  for (const u of TEST_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, name: u.name, role: u.role, status: UserStatus.ACTIVE },
      create: {
        email: u.email,
        passwordHash,
        name: u.name,
        username: u.username,
        role: u.role,
        status: UserStatus.ACTIVE,
        associationId: association.id,
      },
    });
    users[u.email] = user.id;
    console.log(`   ✅ ${u.email} (${u.role})`);
  }

  // Aliases for readability
  const adminId = users['admin@ahub.test']!;
  const joaoId = users['membro@ahub.test']!;
  const mariaId = users['teste@ahub.test']!;
  const anaId = users['ana@ahub.test']!;
  const pedroId = users['pedro@ahub.test']!;
  const lucasId = users['lucas@ahub.test']!;
  const juliaId = users['julia@ahub.test']!;
  const rafaelId = users['rafael@ahub.test']!;
  const camilaId = users['camila@ahub.test']!;
  const brunoId = users['bruno@ahub.test']!;

  const allUserIds = [joaoId, mariaId, anaId, pedroId, lucasId, juliaId, rafaelId, camilaId, brunoId];

  // ─── 3. Subscription Plans (3) ─────────────────────────
  console.log('\n💎 Criando planos de assinatura...\n');

  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'seed-plan-basic' },
    update: { name: 'Basic', priceMonthly: 1990 },
    create: {
      id: 'seed-plan-basic',
      associationId: association.id,
      name: 'Basic',
      description: 'Plano inicial com benefícios essenciais',
      priceMonthly: 1990,
      color: '#3B82F6',
      pointsMultiplier: 1.2,
      storeDiscount: 5,
      pdvDiscount: 5,
      spaceDiscount: 5,
      mutators: { points_events: 1.2, points_strava: 1.2, points_posts: 1.5, discount_store: 5, discount_pdv: 5, discount_spaces: 5, cashback: 3 },
    },
  });

  const premiumPlan = await prisma.subscriptionPlan.upsert({
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
      mutators: { points_events: 1.5, points_strava: 1.5, points_posts: 2.0, discount_store: 10, discount_pdv: 10, discount_spaces: 15, cashback: 5 },
    },
  });

  const goldPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'seed-plan-gold' },
    update: { name: 'Gold', priceMonthly: 8990 },
    create: {
      id: 'seed-plan-gold',
      associationId: association.id,
      name: 'Gold',
      description: 'Experiência premium com máximos benefícios',
      priceMonthly: 8990,
      color: '#EAB308',
      pointsMultiplier: 2.0,
      storeDiscount: 15,
      pdvDiscount: 15,
      spaceDiscount: 25,
      mutators: { points_events: 2.0, points_strava: 2.0, points_posts: 3.0, discount_store: 15, discount_pdv: 15, discount_spaces: 25, cashback: 8 },
    },
  });

  console.log(`   ✅ Basic (R$ 19,90) | Premium (R$ 49,90) | Gold (R$ 89,90)`);

  // ─── 4. User Subscriptions ─────────────────────────────
  console.log('\n🎫 Vinculando assinaturas...\n');

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const subscriptionMap: Array<{ userId: string; planId: string; email: string }> = [
    { userId: joaoId, planId: premiumPlan.id, email: 'membro' },
    { userId: pedroId, planId: premiumPlan.id, email: 'pedro' },
    { userId: anaId, planId: goldPlan.id, email: 'ana' },
    { userId: camilaId, planId: goldPlan.id, email: 'camila' },
    { userId: juliaId, planId: basicPlan.id, email: 'julia' },
  ];

  for (const sub of subscriptionMap) {
    await prisma.userSubscription.upsert({
      where: { userId: sub.userId },
      update: { status: 'ACTIVE', planId: sub.planId },
      create: { userId: sub.userId, planId: sub.planId, status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: periodEnd },
    });
    console.log(`   ✅ ${sub.email} → assinatura ativa`);
  }

  // ─── 5. UserPoints + Varied Transactions ───────────────
  console.log('\n💰 Criando saldos e transações...\n');

  const pointsBalances: Record<string, number> = {
    [adminId]: 5000,
    [joaoId]: 3200,
    [mariaId]: 1800,
    [anaId]: 4500,
    [pedroId]: 2700,
    [lucasId]: 900,
    [juliaId]: 1500,
    [rafaelId]: 600,
    [camilaId]: 3800,
    [brunoId]: 1100,
  };

  for (const [userId, balance] of Object.entries(pointsBalances)) {
    await prisma.userPoints.upsert({
      where: { userId },
      update: { balance, lifetimeEarned: balance + 500, lifetimeSpent: 500 },
      create: { userId, balance, lifetimeEarned: balance + 500, lifetimeSpent: 500 },
    });
  }

  // Create varied point transactions for each user
  const transactionSources = [
    { source: 'ADMIN_CREDIT' as const, description: 'Bônus de boas-vindas', amount: 500 },
    { source: 'EVENT_CHECKIN' as const, description: 'Check-in: Churrasco', amount: 100 },
    { source: 'DAILY_POST' as const, description: 'Post diário', amount: 5 },
    { source: 'SHOP_PURCHASE' as const, description: 'Compra na loja', amount: -300 },
    { source: 'SHOP_CASHBACK' as const, description: 'Cashback loja (5%)', amount: 15 },
    { source: 'EVENT_CHECKIN' as const, description: 'Check-in: Yoga', amount: 50 },
    { source: 'ADMIN_CREDIT' as const, description: 'Bônus campanha mensal', amount: 200 },
    { source: 'DAILY_POST' as const, description: 'Post diário', amount: 5 },
    { source: 'SHOP_PURCHASE' as const, description: 'Compra na loja', amount: -200 },
  ];

  // Clean old transactions and create new ones
  for (const userId of [adminId, ...allUserIds]) {
    await prisma.pointTransaction.deleteMany({ where: { userId } });
    let runningBalance = 0;
    for (let i = 0; i < transactionSources.length; i++) {
      const tx = transactionSources[i]!;
      runningBalance += tx.amount;
      await prisma.pointTransaction.create({
        data: {
          userId,
          amount: tx.amount,
          balance: runningBalance,
          source: tx.source,
          description: tx.description,
          createdAt: daysAgo(30 - i * 3),
        },
      });
    }
  }

  // Transfer between joao and maria
  await prisma.pointTransaction.create({
    data: { userId: joaoId, amount: -100, balance: 3100, source: 'TRANSFER_OUT', description: 'Transferência para Maria', relatedUserId: mariaId, createdAt: daysAgo(5) },
  });
  await prisma.pointTransaction.create({
    data: { userId: mariaId, amount: 100, balance: 1900, source: 'TRANSFER_IN', description: 'Transferência de João', relatedUserId: joaoId, createdAt: daysAgo(5) },
  });

  console.log(`   ✅ ${Object.keys(pointsBalances).length} saldos + transações variadas`);

  // ─── 6. Badges ─────────────────────────────────────────
  console.log('\n🏅 Criando badges...\n');

  const badgesData = [
    { id: 'seed-badge-first-checkin', name: 'Primeiro Check-in', description: 'Fez o primeiro check-in em um evento', iconUrl: '🎯', criteriaType: 'events_count', criteriaValue: 1 },
    { id: 'seed-badge-frequentador', name: 'Frequentador', description: 'Participou de 5 eventos', iconUrl: '⭐', criteriaType: 'events_count', criteriaValue: 5 },
    { id: 'seed-badge-veterano', name: 'Veterano', description: 'Participou de 20 eventos', iconUrl: '🏆', criteriaType: 'events_count', criteriaValue: 20 },
    { id: 'seed-badge-corredor10k', name: 'Corredor 10K', description: 'Correu 10km no Strava', iconUrl: '🏃', criteriaType: 'strava_km', criteriaValue: 10 },
    { id: 'seed-badge-maratonista', name: 'Maratonista', description: 'Correu 42km no Strava', iconUrl: '🥇', criteriaType: 'strava_km', criteriaValue: 42 },
    { id: 'seed-badge-1000pts', name: 'Mil Pontos', description: 'Acumulou 1.000 pontos', iconUrl: '💰', criteriaType: 'points_earned', criteriaValue: 1000 },
    { id: 'seed-badge-10000pts', name: 'Dez Mil Pontos', description: 'Acumulou 10.000 pontos', iconUrl: '💎', criteriaType: 'points_earned', criteriaValue: 10000 },
    { id: 'seed-badge-primeira-compra', name: 'Primeira Compra', description: 'Fez a primeira compra na loja', iconUrl: '🛒', criteriaType: 'purchases_count', criteriaValue: 1 },
    { id: 'seed-badge-social', name: 'Social', description: 'Publicou 10 posts', iconUrl: '📱', criteriaType: 'posts_count', criteriaValue: 10 },
    { id: 'seed-badge-influencer', name: 'Influencer', description: 'Publicou 50 posts', iconUrl: '🌟', criteriaType: 'posts_count', criteriaValue: 50 },
  ];

  const badgeIds: Record<string, string> = {};
  for (const b of badgesData) {
    const badge = await prisma.badge.upsert({
      where: { id: b.id },
      update: { name: b.name },
      create: b,
    });
    badgeIds[b.id] = badge.id;
  }
  console.log(`   ✅ ${badgesData.length} badges`);

  // UserBadges
  const userBadgesData = [
    { userId: joaoId, badgeId: 'seed-badge-first-checkin', isFeatured: true },
    { userId: joaoId, badgeId: 'seed-badge-frequentador' },
    { userId: joaoId, badgeId: 'seed-badge-1000pts', isFeatured: true },
    { userId: joaoId, badgeId: 'seed-badge-primeira-compra' },
    { userId: mariaId, badgeId: 'seed-badge-first-checkin' },
    { userId: mariaId, badgeId: 'seed-badge-1000pts', isFeatured: true },
    { userId: anaId, badgeId: 'seed-badge-first-checkin' },
    { userId: anaId, badgeId: 'seed-badge-frequentador' },
    { userId: anaId, badgeId: 'seed-badge-1000pts' },
    { userId: pedroId, badgeId: 'seed-badge-first-checkin' },
    { userId: pedroId, badgeId: 'seed-badge-corredor10k', isFeatured: true },
    { userId: camilaId, badgeId: 'seed-badge-first-checkin' },
    { userId: camilaId, badgeId: 'seed-badge-1000pts' },
  ];

  for (const ub of userBadgesData) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: ub.userId, badgeId: ub.badgeId } },
      update: {},
      create: { userId: ub.userId, badgeId: ub.badgeId, isFeatured: ub.isFeatured ?? false, earnedAt: daysAgo(Math.floor(Math.random() * 60)) },
    });
  }
  console.log(`   ✅ ${userBadgesData.length} user badges`);

  // ─── 7. Member Cards ───────────────────────────────────
  console.log('\n🪪 Criando carteirinhas...\n');

  let cardSeq = 1;
  for (const userId of allUserIds) {
    const cardNumber = `A-2024-${String(cardSeq++).padStart(5, '0')}`;
    const qrData = JSON.stringify({ userId, cardNumber, assocId: association.id });
    const qrHash = crypto.createHmac('sha256', 'seed-secret-key').update(qrData).digest('hex');

    await prisma.memberCard.upsert({
      where: { userId },
      update: {},
      create: { userId, cardNumber, status: CardStatus.ACTIVE, qrCodeHash: qrHash, qrCodeData: qrData, expiresAt: daysFromNow(365) },
    });
  }
  console.log(`   ✅ ${allUserIds.length} carteirinhas`);

  // ─── 8. Partner Categories + Partners (preserved) ──────
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
      create: { associationId: association.id, name: cat.name, slug: cat.slug, icon: cat.icon, color: cat.color, order: cat.order },
    });
    categories[cat.slug] = category.id;
  }
  console.log(`   ✅ ${categoriesData.length} categorias`);

  // Partners
  console.log('\n🤝 Criando parceiros...\n');

  const partnersData = [
    { name: 'Pizzaria Bella Napoli', categorySlug: 'alimentacao', benefit: '15% de desconto em todos os pratos', instructions: 'Apresente a carteirinha digital antes de fechar a conta.', street: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP', zipCode: '01234-567', lat: -23.5505, lng: -46.6333, phone: '(11) 3456-7890', website: 'https://bellanapolisp.com.br', instagram: '@bellanapolisp', whatsapp: '(11) 91234-5678', businessHours: { monday: '11:00-23:00', tuesday: '11:00-23:00', wednesday: '11:00-23:00', thursday: '11:00-23:00', friday: '11:00-00:00', saturday: '11:00-00:00', sunday: '11:00-22:00' }, eligibleAudiences: [AudienceType.ALL] },
    { name: 'Academia FitMax', categorySlug: 'esportes', benefit: '20% de desconto na mensalidade', instructions: 'Informe que é associado na recepção e apresente o QR Code.', street: 'Av. Paulista, 1500', city: 'São Paulo', state: 'SP', zipCode: '01310-100', lat: -23.5631, lng: -46.6544, phone: '(11) 2345-6789', website: 'https://fitmaxacademia.com.br', instagram: '@fitmaxsp', businessHours: { monday: '06:00-23:00', tuesday: '06:00-23:00', wednesday: '06:00-23:00', thursday: '06:00-23:00', friday: '06:00-22:00', saturday: '08:00-18:00', sunday: '08:00-14:00' }, eligibleAudiences: [AudienceType.SUBSCRIBERS] },
    { name: 'Clínica Sorriso', categorySlug: 'saude', benefit: '10% de desconto em consultas', instructions: 'Agende pelo WhatsApp mencionando a associação.', street: 'Rua Augusta, 890', city: 'São Paulo', state: 'SP', zipCode: '01304-001', lat: -23.5544, lng: -46.6600, phone: '(11) 3678-9012', whatsapp: '(11) 98765-4321', businessHours: { monday: '08:00-18:00', tuesday: '08:00-18:00', wednesday: '08:00-18:00', thursday: '08:00-18:00', friday: '08:00-17:00' }, eligibleAudiences: [AudienceType.ALL] },
    { name: 'Livraria Cultura Viva', categorySlug: 'educacao', benefit: '15% de desconto em livros e cursos', instructions: 'Apresente sua carteirinha no caixa.', street: 'Rua Oscar Freire, 456', city: 'São Paulo', state: 'SP', zipCode: '01426-001', lat: -23.5618, lng: -46.6713, phone: '(11) 4567-8901', website: 'https://culturaviva.com.br', instagram: '@culturavivabooks', facebook: 'culturavivabooks', businessHours: { monday: '09:00-21:00', tuesday: '09:00-21:00', wednesday: '09:00-21:00', thursday: '09:00-21:00', friday: '09:00-22:00', saturday: '10:00-20:00', sunday: '12:00-18:00' }, eligibleAudiences: [AudienceType.ALL] },
    { name: 'Cinema Star', categorySlug: 'lazer', benefit: 'Ingresso com 30% de desconto (seg a qui)', instructions: 'Compre pelo app com código AHUB30.', street: 'Av. Rebouças, 3970', city: 'São Paulo', state: 'SP', zipCode: '05401-450', lat: -23.5700, lng: -46.6850, phone: '(11) 5678-9012', website: 'https://cinemastar.com.br', instagram: '@cinemastarsp', businessHours: { monday: '13:00-23:00', tuesday: '13:00-23:00', wednesday: '13:00-23:00', thursday: '13:00-23:00', friday: '13:00-01:00', saturday: '11:00-01:00', sunday: '11:00-23:00' }, eligibleAudiences: [AudienceType.ALL] },
    { name: 'Auto Center Premium', categorySlug: 'automotivo', benefit: 'Troca de óleo com 25% de desconto', instructions: 'Agende pelo telefone e informe que é associado.', street: 'Rua Vergueiro, 2100', city: 'São Paulo', state: 'SP', zipCode: '04102-000', lat: -23.5880, lng: -46.6380, phone: '(11) 6789-0123', whatsapp: '(11) 97654-3210', businessHours: { monday: '08:00-18:00', tuesday: '08:00-18:00', wednesday: '08:00-18:00', thursday: '08:00-18:00', friday: '08:00-18:00', saturday: '08:00-13:00' }, eligibleAudiences: [AudienceType.SUBSCRIBERS] },
    { name: 'Pet Shop Amigo Fiel', categorySlug: 'varejo', benefit: '10% em ração e acessórios', instructions: 'Válido para compras acima de R$ 50. Apresente a carteirinha.', street: 'Rua Pamplona, 300', city: 'São Paulo', state: 'SP', zipCode: '01405-000', lat: -23.5660, lng: -46.6520, phone: '(11) 7890-1234', instagram: '@amigofielpetshop', businessHours: { monday: '09:00-19:00', tuesday: '09:00-19:00', wednesday: '09:00-19:00', thursday: '09:00-19:00', friday: '09:00-19:00', saturday: '09:00-17:00' }, eligibleAudiences: [AudienceType.ALL] },
    { name: 'Restaurante Sabor da Terra', categorySlug: 'alimentacao', benefit: 'Almoço executivo por R$ 29,90', instructions: 'Diga que é associado ao ser atendido. Válido de seg a sex no almoço.', street: 'Rua Haddock Lobo, 595', city: 'São Paulo', state: 'SP', zipCode: '01414-001', lat: -23.5590, lng: -46.6680, phone: '(11) 8901-2345', businessHours: { monday: '11:30-15:00', tuesday: '11:30-15:00', wednesday: '11:30-15:00', thursday: '11:30-15:00', friday: '11:30-15:00' }, eligibleAudiences: [AudienceType.ALL] },
  ];

  for (const p of partnersData) {
    const catId = categories[p.categorySlug]!;
    const partnerId = `seed-partner-${p.categorySlug}-${p.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}`;
    await prisma.partner.upsert({
      where: { id: partnerId },
      update: { name: p.name, benefit: p.benefit, categoryId: catId },
      create: {
        id: partnerId, associationId: association.id, categoryId: catId,
        name: p.name, benefit: p.benefit, instructions: p.instructions,
        street: p.street, city: p.city, state: p.state, zipCode: p.zipCode, lat: p.lat, lng: p.lng,
        phone: p.phone || null, website: (p as any).website || null, instagram: (p as any).instagram || null,
        facebook: (p as any).facebook || null, whatsapp: (p as any).whatsapp || null,
        businessHours: p.businessHours || null, eligibleAudiences: p.eligibleAudiences, showLocked: true,
      },
    });
  }
  console.log(`   ✅ ${partnersData.length} parceiros`);

  // ─── 9. Events ─────────────────────────────────────────
  console.log('\n📅 Criando eventos...\n');

  const eventsData = [
    { id: 'seed-evt-churrasco', title: 'Churrasco de Confraternização', description: 'Grande churrasco para celebrar o aniversário da associação! Traga sua família e amigos.', category: EventCategory.SOCIAL, status: EventStatus.ENDED, startDate: daysAgo(15), endDate: daysAgo(14), locationName: 'Sede da Associação', locationAddress: 'Rua das Flores, 123 - São Paulo/SP', pointsTotal: 100, checkinsCount: 2, bannerFeed: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop', color: '#EF4444' },
    { id: 'seed-evt-yoga', title: 'Aula de Yoga ao Ar Livre', description: 'Aula de yoga para todos os níveis. Traga seu tapete!', category: EventCategory.SPORTS, status: EventStatus.ENDED, startDate: daysAgo(10), endDate: daysAgo(10), locationName: 'Parque Ibirapuera', locationAddress: 'Av. Pedro Álvares Cabral - São Paulo/SP', pointsTotal: 50, checkinsCount: 1, bannerFeed: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop', color: '#8B5CF6' },
    { id: 'seed-evt-workshop', title: 'Workshop de Fotografia', description: 'Aprenda técnicas profissionais de fotografia com smartphone. Inclui prática ao ar livre.', category: EventCategory.EDUCATIONAL, status: EventStatus.ONGOING, startDate: hoursAgo(2), endDate: hoursFromNow(4), locationName: 'Espaço Cultural', locationAddress: 'Rua Augusta, 500 - São Paulo/SP', pointsTotal: 80, checkinsCount: 3, bannerFeed: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=400&fit=crop', color: '#22C55E' },
    { id: 'seed-evt-happyhour', title: 'Happy Hour', description: 'Venha relaxar após o expediente! Drinks especiais e petiscos.', category: EventCategory.GASTRO, status: EventStatus.SCHEDULED, startDate: daysFromNow(3), endDate: daysFromNow(3), locationName: 'Bar do Zé', locationAddress: 'Rua Oscar Freire, 200 - São Paulo/SP', pointsTotal: 60, checkinsCount: 1, bannerFeed: 'https://images.unsplash.com/photo-1575037614876-c38a4c44f5b8?w=800&h=400&fit=crop', color: '#F97316' },
    { id: 'seed-evt-futsal', title: 'Torneio de Futsal', description: 'Torneio interno de futsal. Inscreva sua equipe de 5 jogadores!', category: EventCategory.SPORTS, status: EventStatus.SCHEDULED, startDate: daysFromNow(7), endDate: daysFromNow(7), locationName: 'Ginásio Municipal', locationAddress: 'Rua Vergueiro, 1000 - São Paulo/SP', pointsTotal: 150, checkinsCount: 4, capacity: 40, bannerFeed: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop', color: '#3B82F6' },
    { id: 'seed-evt-palestra', title: 'Palestra: Saúde Mental', description: 'Palestra sobre bem-estar e saúde mental no ambiente de trabalho.', category: EventCategory.EDUCATIONAL, status: EventStatus.DRAFT, startDate: daysFromNow(14), endDate: daysFromNow(14), locationName: 'Auditório da Sede', locationAddress: 'Rua das Flores, 123 - São Paulo/SP', pointsTotal: 100, checkinsCount: 1, bannerFeed: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=400&fit=crop', color: '#06B6D4' },
  ];

  for (const e of eventsData) {
    await prisma.event.upsert({
      where: { id: e.id },
      update: { title: e.title, status: e.status },
      create: { ...e, associationId: association.id, qrSecret: crypto.randomBytes(16).toString('hex'), createdBy: adminId, checkinInterval: 30 },
    });
  }
  console.log(`   ✅ ${eventsData.length} eventos`);

  // EventConfirmations
  const confirmations = [
    { eventId: 'seed-evt-churrasco', userIds: [joaoId, mariaId, anaId, pedroId, lucasId, camilaId] },
    { eventId: 'seed-evt-yoga', userIds: [mariaId, anaId, juliaId, camilaId] },
    { eventId: 'seed-evt-workshop', userIds: [joaoId, anaId, pedroId, rafaelId, brunoId] },
    { eventId: 'seed-evt-happyhour', userIds: [joaoId, mariaId, pedroId, lucasId, rafaelId] },
    { eventId: 'seed-evt-futsal', userIds: [joaoId, pedroId, lucasId, rafaelId, brunoId] },
  ];

  for (const conf of confirmations) {
    for (const userId of conf.userIds) {
      await prisma.eventConfirmation.upsert({
        where: { eventId_userId: { eventId: conf.eventId, userId } },
        update: {},
        create: { eventId: conf.eventId, userId },
      });
    }
  }

  // EventCheckIns for ended events
  const checkIns = [
    { eventId: 'seed-evt-churrasco', userIds: [joaoId, mariaId, anaId, pedroId], pointsPerCheckin: 50 },
    { eventId: 'seed-evt-yoga', userIds: [mariaId, anaId, juliaId], pointsPerCheckin: 50 },
  ];

  for (const ci of checkIns) {
    for (const userId of ci.userIds) {
      await prisma.eventCheckIn.upsert({
        where: { eventId_userId_checkinNumber: { eventId: ci.eventId, userId, checkinNumber: 1 } },
        update: {},
        create: { eventId: ci.eventId, userId, checkinNumber: 1, pointsAwarded: ci.pointsPerCheckin },
      });
    }
  }

  // EventComments
  const eventComments = [
    { eventId: 'seed-evt-churrasco', userId: joaoId, text: 'Que churrasco incrível! Parabéns pela organização!' },
    { eventId: 'seed-evt-churrasco', userId: mariaId, text: 'A picanha estava sensacional 🔥' },
    { eventId: 'seed-evt-churrasco', userId: anaId, text: 'Já quero o próximo!' },
    { eventId: 'seed-evt-yoga', userId: mariaId, text: 'Aula maravilhosa, super relaxante' },
    { eventId: 'seed-evt-yoga', userId: juliaId, text: 'Adorei! Podemos fazer toda semana?' },
  ];

  for (const ec of eventComments) {
    await prisma.eventComment.create({
      data: { eventId: ec.eventId, userId: ec.userId, text: ec.text, contentType: EventCommentContentType.TEXT, createdAt: daysAgo(Math.floor(Math.random() * 10)) },
    });
  }
  console.log(`   ✅ Confirmações, check-ins e comentários de eventos`);

  // ─── 10. Notifications ─────────────────────────────────
  console.log('\n🔔 Criando notificações...\n');

  const notificationsData = [
    { userId: joaoId, type: NotificationType.POINTS_RECEIVED, category: NotificationCategory.POINTS, title: 'Pontos recebidos!', body: 'Você ganhou 100 pontos pelo check-in no Churrasco', isRead: true },
    { userId: joaoId, type: NotificationType.NEW_EVENT, category: NotificationCategory.EVENTS, title: 'Novo evento!', body: 'Happy Hour - dia 25 às 18h', isRead: false },
    { userId: joaoId, type: NotificationType.NEW_MESSAGE, category: NotificationCategory.SYSTEM, title: 'Nova mensagem', body: 'Maria Santos enviou uma mensagem', isRead: false },
    { userId: mariaId, type: NotificationType.TRANSFER_RECEIVED, category: NotificationCategory.POINTS, title: 'Transferência recebida', body: 'João Silva transferiu 100 pontos para você', isRead: true },
    { userId: mariaId, type: NotificationType.EVENT_REMINDER_1DAY, category: NotificationCategory.EVENTS, title: 'Lembrete de evento', body: 'Happy Hour é amanhã!', isRead: false },
    { userId: anaId, type: NotificationType.BADGE_EARNED, category: NotificationCategory.EVENTS, title: 'Badge conquistado!', body: 'Você ganhou o badge "Frequentador"', isRead: true },
    { userId: anaId, type: NotificationType.NEW_LIKE, category: NotificationCategory.SOCIAL, title: 'Curtida no seu post', body: 'João Silva curtiu seu post', isRead: false },
    { userId: pedroId, type: NotificationType.STRAVA_SYNC, category: NotificationCategory.POINTS, title: 'Strava sincronizado', body: 'Corrida de 5km = 50 pontos!', isRead: true },
    { userId: lucasId, type: NotificationType.NEW_EVENT, category: NotificationCategory.EVENTS, title: 'Torneio de Futsal', body: 'Inscrições abertas para o torneio!', isRead: false },
    { userId: juliaId, type: NotificationType.ADMIN_ANNOUNCEMENT, category: NotificationCategory.SYSTEM, title: 'Novidade!', body: 'Nova parceria com Cinema Star. Confira os benefícios!', isRead: false },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({
      data: { ...n, readAt: n.isRead ? daysAgo(1) : null, createdAt: daysAgo(Math.floor(Math.random() * 7)) },
    });
  }
  console.log(`   ✅ ${notificationsData.length} notificações`);

  // ─── 11. Conversations + Messages ──────────────────────
  console.log('\n💬 Criando conversas e mensagens...\n');

  // Direct: João ↔ Maria
  const conv1 = await prisma.conversation.create({ data: { type: ConversationType.DIRECT } });
  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv1.id, userId: joaoId, role: ConversationRole.MEMBER, lastReadAt: hoursAgo(1) },
      { conversationId: conv1.id, userId: mariaId, role: ConversationRole.MEMBER, lastReadAt: hoursAgo(3) },
    ],
  });
  const dm1Messages = [
    { senderId: joaoId, content: 'E aí Maria, vai no happy hour sexta?', createdAt: daysAgo(2) },
    { senderId: mariaId, content: 'Opa! Com certeza, que horas?', createdAt: daysAgo(2) },
    { senderId: joaoId, content: 'Começa às 18h no Bar do Zé', createdAt: daysAgo(2) },
    { senderId: mariaId, content: 'Fechou! Vou chamar a Ana também', createdAt: daysAgo(2) },
    { senderId: joaoId, content: 'Beleza, quanto mais gente melhor!', createdAt: daysAgo(1) },
    { senderId: mariaId, content: 'Ela confirmou! Até sexta 🎉', createdAt: daysAgo(1) },
  ];
  for (const msg of dm1Messages) {
    await prisma.message.create({
      data: { conversationId: conv1.id, senderId: msg.senderId, content: msg.content, contentType: MessageContentType.TEXT, status: MessageStatus.DELIVERED, createdAt: msg.createdAt },
    });
  }

  // Direct: João ↔ Ana
  const conv2 = await prisma.conversation.create({ data: { type: ConversationType.DIRECT } });
  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv2.id, userId: joaoId, role: ConversationRole.MEMBER, lastReadAt: hoursAgo(5) },
      { conversationId: conv2.id, userId: anaId, role: ConversationRole.MEMBER, lastReadAt: daysAgo(1) },
    ],
  });
  const dm2Messages = [
    { senderId: anaId, content: 'João, você viu a promoção da creatina na loja?', createdAt: daysAgo(3) },
    { senderId: joaoId, content: 'Vi sim! Tá com 25% de desconto né?', createdAt: daysAgo(3) },
    { senderId: anaId, content: 'Isso! Vou comprar antes de acabar', createdAt: daysAgo(3) },
    { senderId: joaoId, content: 'Boa! Eu já comprei a minha semana passada 💪', createdAt: daysAgo(2) },
  ];
  for (const msg of dm2Messages) {
    await prisma.message.create({
      data: { conversationId: conv2.id, senderId: msg.senderId, content: msg.content, contentType: MessageContentType.TEXT, status: MessageStatus.READ, createdAt: msg.createdAt },
    });
  }

  // Group: Futsal
  const conv3 = await prisma.conversation.create({ data: { type: ConversationType.GROUP } });
  await prisma.conversationGroup.create({
    data: { conversationId: conv3.id, name: 'Grupo do Futsal', description: 'Organização do torneio de futsal', createdById: pedroId },
  });
  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv3.id, userId: joaoId, role: ConversationRole.MEMBER, lastReadAt: hoursAgo(2) },
      { conversationId: conv3.id, userId: pedroId, role: ConversationRole.ADMIN, lastReadAt: hoursAgo(1) },
      { conversationId: conv3.id, userId: lucasId, role: ConversationRole.MEMBER, lastReadAt: daysAgo(1) },
      { conversationId: conv3.id, userId: rafaelId, role: ConversationRole.MEMBER, lastReadAt: daysAgo(2) },
      { conversationId: conv3.id, userId: brunoId, role: ConversationRole.MEMBER, lastReadAt: hoursAgo(6) },
    ],
  });
  const groupMessages = [
    { senderId: pedroId, content: 'Fala galera! Montei o grupo pro torneio de futsal' },
    { senderId: joaoId, content: 'Bora! Quando é?' },
    { senderId: pedroId, content: 'Semana que vem, sábado às 14h' },
    { senderId: lucasId, content: 'Conta comigo!' },
    { senderId: rafaelId, content: 'Tô dentro. Quem mais vai?' },
    { senderId: brunoId, content: 'Eu vou! Precisamos de mais um pra fechar o time' },
    { senderId: pedroId, content: 'Vou chamar o Bruno do trabalho' },
    { senderId: joaoId, content: 'Boa! Uniforme vai ser qual?' },
  ];
  for (let i = 0; i < groupMessages.length; i++) {
    await prisma.message.create({
      data: { conversationId: conv3.id, senderId: groupMessages[i]!.senderId, content: groupMessages[i]!.content, contentType: MessageContentType.TEXT, status: MessageStatus.DELIVERED, createdAt: daysAgo(5 - Math.floor(i / 3)) },
    });
  }

  // Group: Meninas
  const conv4 = await prisma.conversation.create({ data: { type: ConversationType.GROUP } });
  await prisma.conversationGroup.create({
    data: { conversationId: conv4.id, name: 'Meninas da Associação', description: 'Grupo das meninas', createdById: mariaId },
  });
  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv4.id, userId: mariaId, role: ConversationRole.ADMIN, lastReadAt: hoursAgo(1) },
      { conversationId: conv4.id, userId: anaId, role: ConversationRole.MEMBER, lastReadAt: hoursAgo(3) },
      { conversationId: conv4.id, userId: juliaId, role: ConversationRole.MEMBER, lastReadAt: daysAgo(1) },
      { conversationId: conv4.id, userId: camilaId, role: ConversationRole.MEMBER, lastReadAt: hoursAgo(2) },
    ],
  });
  const girlsMessages = [
    { senderId: mariaId, content: 'Meninas, bora combinar a aula de yoga?' },
    { senderId: anaId, content: 'Sim!! A última foi maravilhosa' },
    { senderId: juliaId, content: 'Quero ir! Quando é a próxima?' },
    { senderId: camilaId, content: 'Sábado de manhã seria perfeito' },
    { senderId: mariaId, content: 'Sábado 8h no Ibirapuera?' },
    { senderId: anaId, content: 'Perfeito! Confirmado 🧘‍♀️' },
  ];
  for (let i = 0; i < girlsMessages.length; i++) {
    await prisma.message.create({
      data: { conversationId: conv4.id, senderId: girlsMessages[i]!.senderId, content: girlsMessages[i]!.content, contentType: MessageContentType.TEXT, status: MessageStatus.DELIVERED, createdAt: daysAgo(3 - Math.floor(i / 3)) },
    });
  }
  console.log(`   ✅ 4 conversas com mensagens`);

  // ─── 12. Store (preserved) ─────────────────────────────
  console.log('\n🛒 Criando loja...\n');

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
      create: { associationId: association.id, name: sc.name, slug: sc.slug, displayOrder: sc.displayOrder },
    });
    storeCategories[sc.slug] = cat.id;
  }

  const productsData = [
    { id: 'seed-prod-camiseta', slug: 'camiseta-oficial', name: 'Camiseta Oficial', shortDescription: 'Camiseta oficial da associação em algodão premium', longDescription: 'Camiseta oficial da Associação Demo, confeccionada em algodão 100% penteado, com estampa serigrafada de alta qualidade.', categorySlug: 'vestuario', type: ProductType.PHYSICAL, pricePoints: 500, priceMoney: 49.90, paymentOptions: PaymentOptions.BOTH, stockType: 'limited', stockCount: 100, limitPerUser: 5, cashbackPercent: 5.0, isFeatured: true, averageRating: 4.7, reviewCount: 23, soldCount: 85, pickupLocation: 'Sede da Associação - Recepção' },
    { id: 'seed-prod-bone', slug: 'bone-bordado', name: 'Boné Bordado', shortDescription: 'Boné com logo bordado, ajuste snapback', categorySlug: 'acessorios', type: ProductType.PHYSICAL, pricePoints: 300, priceMoney: 29.90, paymentOptions: PaymentOptions.BOTH, stockType: 'limited', stockCount: 60, limitPerUser: 3, cashbackPercent: 5.0, isFeatured: true, averageRating: 4.5, reviewCount: 12, soldCount: 45 },
    { id: 'seed-prod-whey', slug: 'whey-protein-900g', name: 'Whey Protein 900g', shortDescription: 'Whey concentrado sabor chocolate, 900g', longDescription: 'Whey Protein Concentrado com 24g de proteína por dose. Sabor chocolate.', categorySlug: 'suplementos', type: ProductType.PHYSICAL, pricePoints: 1200, priceMoney: 119.90, paymentOptions: PaymentOptions.BOTH, stockType: 'limited', stockCount: 30, limitPerUser: 2, cashbackPercent: 5.0, averageRating: 4.8, reviewCount: 31, soldCount: 120 },
    { id: 'seed-prod-creatina', slug: 'creatina-300g', name: 'Creatina 300g', shortDescription: 'Creatina monoidratada pura, 300g', categorySlug: 'suplementos', type: ProductType.PHYSICAL, pricePoints: 600, priceMoney: 59.90, paymentOptions: PaymentOptions.BOTH, stockType: 'limited', stockCount: 40, cashbackPercent: 5.0, isPromotional: true, promotionalPricePoints: 450, promotionalPriceMoney: 44.90, promotionalEndsAt: daysFromNow(30), averageRating: 4.6, reviewCount: 18, soldCount: 75 },
    { id: 'seed-prod-garrafa', slug: 'garrafa-termica', name: 'Garrafa Térmica', shortDescription: 'Garrafa inox 750ml, mantém temperatura por 12h', categorySlug: 'acessorios', type: ProductType.PHYSICAL, pricePoints: 400, priceMoney: 39.90, paymentOptions: PaymentOptions.BOTH, stockType: 'limited', stockCount: 50, limitPerUser: 3, cashbackPercent: 5.0, isFeatured: true, averageRating: 4.9, reviewCount: 8, soldCount: 35 },
    { id: 'seed-prod-voucher-restaurante', slug: 'voucher-restaurante', name: 'Voucher Restaurante', shortDescription: 'Vale-refeição de R$ 30 nos parceiros', categorySlug: 'vouchers', type: ProductType.VOUCHER, pricePoints: 200, priceMoney: 19.90, paymentOptions: PaymentOptions.BOTH, stockType: 'unlimited', voucherValidityDays: 30, cashbackPercent: 0, soldCount: 200 },
    { id: 'seed-prod-voucher-cinema', slug: 'voucher-cinema', name: 'Voucher Cinema', shortDescription: 'Ingresso de cinema válido em qualquer sessão', categorySlug: 'vouchers', type: ProductType.VOUCHER, pricePoints: 350, priceMoney: null as number | null, paymentOptions: PaymentOptions.POINTS_ONLY, stockType: 'unlimited', voucherValidityDays: 30, cashbackPercent: 0, soldCount: 150 },
    { id: 'seed-prod-adesivo', slug: 'adesivo-logo', name: 'Adesivo Logo', shortDescription: 'Adesivo vinil com logo da associação', categorySlug: 'brindes', type: ProductType.PHYSICAL, pricePoints: 50, priceMoney: null as number | null, paymentOptions: PaymentOptions.POINTS_ONLY, stockType: 'limited', stockCount: 200, cashbackPercent: 0, soldCount: 180 },
    { id: 'seed-prod-chaveiro', slug: 'chaveiro-metal', name: 'Chaveiro Metal', shortDescription: 'Chaveiro em metal com acabamento premium', categorySlug: 'brindes', type: ProductType.PHYSICAL, pricePoints: 100, priceMoney: 9.90, paymentOptions: PaymentOptions.BOTH, stockType: 'limited', stockCount: 80, cashbackPercent: 5.0, soldCount: 60 },
    { id: 'seed-prod-regata', slug: 'regata-treino', name: 'Regata Treino', shortDescription: 'Regata dry-fit para treinos', categorySlug: 'vestuario', type: ProductType.PHYSICAL, pricePoints: 400, priceMoney: 39.90, paymentOptions: PaymentOptions.BOTH, stockType: 'limited', stockCount: 70, limitPerUser: 5, cashbackPercent: 5.0, isPromotional: true, promotionalPricePoints: 300, promotionalPriceMoney: 29.90, promotionalEndsAt: daysFromNow(15), averageRating: 4.4, reviewCount: 9, soldCount: 55 },
    { id: 'seed-prod-meia', slug: 'meia-esportiva-3-pares', name: 'Meia Esportiva (3 pares)', shortDescription: 'Kit com 3 pares de meias esportivas', categorySlug: 'vestuario', type: ProductType.PHYSICAL, pricePoints: 150, priceMoney: 14.90, paymentOptions: PaymentOptions.BOTH, stockType: 'limited', stockCount: 90, cashbackPercent: 5.0, soldCount: 40 },
    { id: 'seed-prod-toalha', slug: 'toalha-microfibra', name: 'Toalha Microfibra', shortDescription: 'Toalha de secagem rápida para academia', categorySlug: 'acessorios', type: ProductType.PHYSICAL, pricePoints: null as number | null, priceMoney: 24.90, paymentOptions: PaymentOptions.MONEY_ONLY, stockType: 'limited', stockCount: 45, cashbackPercent: 5.0, averageRating: 4.3, reviewCount: 5, soldCount: 25 },
  ];

  const productIds: Record<string, string> = {};
  for (const p of productsData) {
    const catId = storeCategories[p.categorySlug]!;
    const product = await prisma.storeProduct.upsert({
      where: { id: p.id },
      update: { name: p.name },
      create: {
        id: p.id, categoryId: catId, name: p.name, slug: p.slug,
        shortDescription: p.shortDescription, longDescription: (p as any).longDescription || null,
        type: p.type, pricePoints: p.pricePoints, priceMoney: p.priceMoney,
        paymentOptions: p.paymentOptions, allowMixedPayment: p.paymentOptions === PaymentOptions.BOTH,
        stockType: p.stockType, stockCount: p.stockCount || null, limitPerUser: (p as any).limitPerUser || null,
        cashbackPercent: p.cashbackPercent || null, voucherValidityDays: (p as any).voucherValidityDays || null,
        isFeatured: (p as any).isFeatured || false, isPromotional: (p as any).isPromotional || false,
        promotionalPricePoints: (p as any).promotionalPricePoints || null, promotionalPriceMoney: (p as any).promotionalPriceMoney || null,
        promotionalEndsAt: (p as any).promotionalEndsAt || null,
        averageRating: (p as any).averageRating || null, reviewCount: (p as any).reviewCount || 0, soldCount: (p as any).soldCount || 0,
        pickupLocation: (p as any).pickupLocation || null,
      },
    });
    productIds[p.slug] = product.id;
  }
  console.log(`   ✅ ${productsData.length} produtos`);

  // Product Images (Unsplash)
  const imagesData = [
    { productSlug: 'camiseta-oficial', images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop', altText: 'Camiseta Oficial - Frente', displayOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop', altText: 'Camiseta Oficial - Costas', displayOrder: 1 },
    ]},
    { productSlug: 'bone-bordado', images: [{ url: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=600&fit=crop', altText: 'Boné Bordado', displayOrder: 0 }]},
    { productSlug: 'whey-protein-900g', images: [
      { url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&h=600&fit=crop', altText: 'Whey Protein 900g', displayOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=600&fit=crop', altText: 'Whey - Tabela Nutricional', displayOrder: 1 },
    ]},
    { productSlug: 'creatina-300g', images: [{ url: 'https://images.unsplash.com/photo-1619735023823-0d0eb95cfc34?w=600&h=600&fit=crop', altText: 'Creatina 300g', displayOrder: 0 }]},
    { productSlug: 'garrafa-termica', images: [{ url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop', altText: 'Garrafa Térmica', displayOrder: 0 }]},
    { productSlug: 'voucher-restaurante', images: [{ url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=600&fit=crop', altText: 'Voucher Restaurante', displayOrder: 0 }]},
    { productSlug: 'voucher-cinema', images: [{ url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=600&fit=crop', altText: 'Voucher Cinema', displayOrder: 0 }]},
    { productSlug: 'adesivo-logo', images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop', altText: 'Adesivo Logo', displayOrder: 0 }]},
    { productSlug: 'chaveiro-metal', images: [{ url: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&h=600&fit=crop', altText: 'Chaveiro Metal', displayOrder: 0 }]},
    { productSlug: 'regata-treino', images: [{ url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=600&fit=crop', altText: 'Regata Treino', displayOrder: 0 }]},
    { productSlug: 'meia-esportiva-3-pares', images: [{ url: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&h=600&fit=crop', altText: 'Meia Esportiva', displayOrder: 0 }]},
    { productSlug: 'toalha-microfibra', images: [{ url: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&h=600&fit=crop', altText: 'Toalha Microfibra', displayOrder: 0 }]},
  ];

  for (const item of imagesData) {
    const pid = productIds[item.productSlug]!;
    await prisma.productImage.deleteMany({ where: { productId: pid } });
    for (const img of item.images) {
      await prisma.productImage.create({ data: { productId: pid, url: img.url, altText: img.altText, displayOrder: img.displayOrder } });
    }
  }

  // Variants
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
        create: { productId: pid, sku: v.sku, name: v.name, attributes: v.attributes, stockCount: v.stockCount },
      });
    }
  }

  // Specs
  const specsData = [
    { productSlug: 'whey-protein-900g', specs: [{ key: 'Tipo', value: 'Whey Concentrado', displayOrder: 0 }, { key: 'Peso', value: '900g', displayOrder: 1 }, { key: 'Sabor', value: 'Chocolate', displayOrder: 2 }, { key: 'Proteína por dose', value: '24g', displayOrder: 3 }]},
    { productSlug: 'creatina-300g', specs: [{ key: 'Tipo', value: 'Monoidratada', displayOrder: 0 }, { key: 'Peso', value: '300g', displayOrder: 1 }, { key: 'Doses', value: '60 doses de 5g', displayOrder: 2 }]},
    { productSlug: 'garrafa-termica', specs: [{ key: 'Material', value: 'Aço Inox 304', displayOrder: 0 }, { key: 'Capacidade', value: '750ml', displayOrder: 1 }, { key: 'Isolamento', value: '12h quente / 24h frio', displayOrder: 2 }]},
    { productSlug: 'camiseta-oficial', specs: [{ key: 'Material', value: '100% Algodão Penteado', displayOrder: 0 }, { key: 'Gramatura', value: '160g/m²', displayOrder: 1 }, { key: 'Estampa', value: 'Serigrafia', displayOrder: 2 }]},
  ];

  for (const item of specsData) {
    const pid = productIds[item.productSlug]!;
    await prisma.productSpecification.deleteMany({ where: { productId: pid } });
    for (const spec of item.specs) {
      await prisma.productSpecification.create({ data: { productId: pid, key: spec.key, value: spec.value, displayOrder: spec.displayOrder } });
    }
  }
  console.log(`   ✅ Imagens, variantes e especificações`);

  // ─── 13. Orders + Reviews ──────────────────────────────
  console.log('\n📦 Criando pedidos...\n');

  const ordersData = [
    { id: 'seed-order-001', code: 'A1B2C3', userId: joaoId, status: OrderStatus.COMPLETED, paymentMethod: OrderPaymentMethod.POINTS, pointsUsed: 500, moneyPaid: 0, productSlug: 'camiseta-oficial', qty: 1, unitPts: 500, unitMoney: 49.90 },
    { id: 'seed-order-002', code: 'D4E5F6', userId: mariaId, status: OrderStatus.COMPLETED, paymentMethod: OrderPaymentMethod.MONEY, pointsUsed: 0, moneyPaid: 29.90, productSlug: 'bone-bordado', qty: 1, unitPts: 300, unitMoney: 29.90 },
    { id: 'seed-order-003', code: 'G7H8I9', userId: anaId, status: OrderStatus.READY, paymentMethod: OrderPaymentMethod.MIXED, pointsUsed: 300, moneyPaid: 29.95, productSlug: 'creatina-300g', qty: 1, unitPts: 450, unitMoney: 44.90 },
    { id: 'seed-order-004', code: 'J1K2L3', userId: pedroId, status: OrderStatus.CONFIRMED, paymentMethod: OrderPaymentMethod.POINTS, pointsUsed: 400, moneyPaid: 0, productSlug: 'garrafa-termica', qty: 1, unitPts: 400, unitMoney: 39.90 },
    { id: 'seed-order-005', code: 'M4N5O6', userId: lucasId, status: OrderStatus.PENDING, paymentMethod: OrderPaymentMethod.MONEY, pointsUsed: 0, moneyPaid: 14.90, productSlug: 'meia-esportiva-3-pares', qty: 1, unitPts: 150, unitMoney: 14.90 },
    { id: 'seed-order-006', code: 'P7Q8R9', userId: juliaId, status: OrderStatus.CANCELLED, paymentMethod: OrderPaymentMethod.POINTS, pointsUsed: 200, moneyPaid: 0, productSlug: 'voucher-restaurante', qty: 1, unitPts: 200, unitMoney: 19.90 },
    { id: 'seed-order-007', code: 'S1T2U3', userId: joaoId, status: OrderStatus.COMPLETED, paymentMethod: OrderPaymentMethod.POINTS, pointsUsed: 100, moneyPaid: 0, productSlug: 'chaveiro-metal', qty: 1, unitPts: 100, unitMoney: 9.90 },
    { id: 'seed-order-008', code: 'V4W5X6', userId: camilaId, status: OrderStatus.COMPLETED, paymentMethod: OrderPaymentMethod.MIXED, pointsUsed: 200, moneyPaid: 19.90, productSlug: 'whey-protein-900g', qty: 1, unitPts: 1200, unitMoney: 119.90 },
  ];

  for (const o of ordersData) {
    const totalPts = o.unitPts * o.qty;
    const totalMoney = o.unitMoney * o.qty;
    await prisma.order.upsert({
      where: { id: o.id },
      update: { status: o.status },
      create: {
        id: o.id, code: o.code, userId: o.userId,
        source: OrderSource.STORE, sourceId: 'store', sourceName: 'Loja Online',
        subtotalPoints: totalPts, subtotalMoney: totalMoney,
        paymentMethod: o.paymentMethod, pointsUsed: o.pointsUsed, moneyPaid: o.moneyPaid,
        status: o.status,
        pickupCode: `PK-${o.code}`, pickupLocation: 'Sede da Associação',
        cancelledBy: o.status === OrderStatus.CANCELLED ? o.userId : null,
        cancelledReason: o.status === OrderStatus.CANCELLED ? 'Não vou mais precisar' : null,
        cancelledAt: o.status === OrderStatus.CANCELLED ? daysAgo(3) : null,
        createdAt: daysAgo(Math.floor(Math.random() * 20) + 1),
      },
    });

    // OrderItems
    const existingItems = await prisma.orderItem.findMany({ where: { orderId: o.id } });
    if (existingItems.length === 0) {
      await prisma.orderItem.create({
        data: {
          orderId: o.id, productId: productIds[o.productSlug]!, productName: productsData.find(p => p.slug === o.productSlug)!.name,
          productImage: imagesData.find(i => i.productSlug === o.productSlug)?.images[0]?.url || null,
          quantity: o.qty, unitPricePoints: o.unitPts, unitPriceMoney: o.unitMoney,
          totalPoints: totalPts, totalMoney: totalMoney, type: OrderItemType.PHYSICAL,
        },
      });
    }

    // OrderStatusHistory
    const existingHistory = await prisma.orderStatusHistory.findFirst({ where: { orderId: o.id } });
    if (!existingHistory) {
      await prisma.orderStatusHistory.create({
        data: { orderId: o.id, status: OrderStatus.PENDING, changedByName: 'Sistema', createdAt: daysAgo(20) },
      });
      if (o.status !== OrderStatus.PENDING && o.status !== OrderStatus.CANCELLED) {
        await prisma.orderStatusHistory.create({
          data: { orderId: o.id, status: o.status, changedByName: 'Admin', createdAt: daysAgo(18) },
        });
      }
    }
  }
  console.log(`   ✅ ${ordersData.length} pedidos`);

  // Product Reviews
  const reviewsData = [
    { productSlug: 'camiseta-oficial', userId: joaoId, orderId: 'seed-order-001', rating: 5, comment: 'Qualidade excelente! Tecido super confortável.', status: ReviewStatus.APPROVED },
    { productSlug: 'bone-bordado', userId: mariaId, orderId: 'seed-order-002', rating: 4, comment: 'Bordado muito bonito, ótimo acabamento.', status: ReviewStatus.APPROVED },
    { productSlug: 'creatina-300g', userId: anaId, orderId: 'seed-order-003', rating: 5, comment: 'Melhor custo-benefício! Estou amando.', status: ReviewStatus.APPROVED },
    { productSlug: 'garrafa-termica', userId: pedroId, orderId: 'seed-order-004', rating: 5, comment: 'Mantém a água gelada o dia todo!', status: ReviewStatus.APPROVED },
    { productSlug: 'chaveiro-metal', userId: joaoId, orderId: 'seed-order-007', rating: 4, comment: 'Bonito e resistente. Recomendo!', status: ReviewStatus.APPROVED },
    { productSlug: 'whey-protein-900g', userId: camilaId, orderId: 'seed-order-008', rating: 5, comment: 'Sabor chocolate muito bom, dissolve fácil.', status: ReviewStatus.APPROVED },
    { productSlug: 'camiseta-oficial', userId: anaId, orderId: 'seed-order-003', rating: 4, comment: 'Gostei bastante, mas poderia ter mais cores.', status: ReviewStatus.PENDING },
  ];

  for (const r of reviewsData) {
    const pid = productIds[r.productSlug]!;
    await prisma.productReview.upsert({
      where: { productId_userId_orderId: { productId: pid, userId: r.userId, orderId: r.orderId } },
      update: {},
      create: { productId: pid, userId: r.userId, orderId: r.orderId, rating: r.rating, comment: r.comment, status: r.status, createdAt: daysAgo(Math.floor(Math.random() * 15)) },
    });
  }
  console.log(`   ✅ ${reviewsData.length} reviews`);

  // ─── 14. Stories ───────────────────────────────────────
  console.log('\n📸 Criando stories...\n');

  const storiesData = [
    { userId: joaoId, type: StoryType.IMAGE, mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=700&fit=crop', expiresAt: hoursFromNow(20) },
    { userId: mariaId, type: StoryType.TEXT, text: 'Amei a aula de yoga hoje! 🧘‍♀️', backgroundColor: '#8B5CF6', expiresAt: hoursFromNow(16) },
    { userId: anaId, type: StoryType.IMAGE, mediaUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=700&fit=crop', expiresAt: hoursFromNow(12) },
    { userId: pedroId, type: StoryType.TEXT, text: 'Bora treinar! 💪🔥', backgroundColor: '#EF4444', expiresAt: hoursFromNow(8) },
    { userId: camilaId, type: StoryType.IMAGE, mediaUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=700&fit=crop', expiresAt: daysAgo(1) },
    { userId: lucasId, type: StoryType.TEXT, text: 'Chegou meu kit da loja! Top demais', backgroundColor: '#22C55E', expiresAt: daysAgo(1) },
  ];

  const storyIds: string[] = [];
  for (const s of storiesData) {
    const story = await prisma.story.create({
      data: { userId: s.userId, associationId: association.id, type: s.type, mediaUrl: s.mediaUrl || null, text: s.text || null, backgroundColor: s.backgroundColor || null, expiresAt: s.expiresAt },
    });
    storyIds.push(story.id);
  }

  // Story views
  for (let i = 0; i < 4; i++) {
    const viewers = allUserIds.filter(id => id !== storiesData[i]!.userId).slice(0, 4);
    for (const viewerId of viewers) {
      await prisma.storyView.create({
        data: { storyId: storyIds[i]!, viewerId },
      }).catch(() => {});
    }
  }
  console.log(`   ✅ ${storiesData.length} stories`);

  // ─── 15. Posts + Likes + Comments + Polls ──────────────
  console.log('\n📝 Criando posts e feed...\n');

  const postsData = [
    { id: 'seed-post-1', authorId: joaoId, type: PostType.PHOTO, imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop', description: 'Treino pesado hoje! Nada como começar o dia com energia 💪', likesCount: 8, commentsCount: 3 },
    { id: 'seed-post-2', authorId: mariaId, type: PostType.PHOTO, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop', description: 'Yoga no parque com as amigas! Momento zen 🧘‍♀️', likesCount: 12, commentsCount: 4 },
    { id: 'seed-post-3', authorId: anaId, type: PostType.POLL, description: 'Qual deve ser o próximo evento da associação?', likesCount: 5, commentsCount: 2 },
    { id: 'seed-post-4', authorId: pedroId, type: PostType.PHOTO, imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=600&fit=crop', description: 'Quem vem pro futsal sábado? Precisamos fechar o time!', likesCount: 6, commentsCount: 5 },
    { id: 'seed-post-5', authorId: lucasId, type: PostType.PHOTO, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop', description: 'Chegou minha camiseta oficial! Ficou demais 🎉', likesCount: 15, commentsCount: 3 },
    { id: 'seed-post-6', authorId: juliaId, type: PostType.PHOTO, imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=600&fit=crop', description: 'Receita fit do dia: bowl de açaí proteico 🥣', likesCount: 9, commentsCount: 2 },
    { id: 'seed-post-7', authorId: rafaelId, type: PostType.POLL, description: 'Qual o melhor horário para treinar?', likesCount: 4, commentsCount: 1 },
    { id: 'seed-post-8', authorId: camilaId, type: PostType.PHOTO, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=600&fit=crop', description: 'Churrasco da associação foi incrível! Já quero o próximo 🥩🔥', likesCount: 20, commentsCount: 6, isPinned: true },
  ];

  for (const p of postsData) {
    await prisma.post.upsert({
      where: { id: p.id },
      update: {},
      create: { id: p.id, authorId: p.authorId, associationId: association.id, type: p.type, imageUrl: p.imageUrl || null, description: p.description, likesCount: p.likesCount, commentsCount: p.commentsCount, isPinned: (p as any).isPinned || false, createdAt: daysAgo(Math.floor(Math.random() * 14)) },
    });
  }

  // PostLikes
  for (const post of postsData) {
    const likers = allUserIds.filter(id => id !== post.authorId).slice(0, post.likesCount);
    for (const userId of likers) {
      await prisma.postLike.upsert({
        where: { postId_userId: { postId: post.id, userId } },
        update: {},
        create: { postId: post.id, userId },
      });
    }
  }

  // FeedComments
  const feedCommentsData = [
    { postId: 'seed-post-1', authorId: mariaId, text: 'Isso aí, João! 🔥' },
    { postId: 'seed-post-1', authorId: pedroId, text: 'Bora treinar junto amanhã!' },
    { postId: 'seed-post-2', authorId: joaoId, text: 'Que foto linda! O parque tava bonito' },
    { postId: 'seed-post-2', authorId: camilaId, text: 'Quero ir na próxima!' },
    { postId: 'seed-post-4', authorId: joaoId, text: 'Eu vou! Já separei a chuteira' },
    { postId: 'seed-post-4', authorId: lucasId, text: 'Conta comigo, Pedro!' },
    { postId: 'seed-post-4', authorId: brunoId, text: 'Tô dentro! Qual posição?' },
    { postId: 'seed-post-5', authorId: mariaId, text: 'Que massa! Ficou top!' },
    { postId: 'seed-post-5', authorId: anaId, text: 'Também quero comprar a minha' },
    { postId: 'seed-post-8', authorId: joaoId, text: 'Foi demais! Melhor evento do ano' },
    { postId: 'seed-post-8', authorId: anaId, text: 'Concordo! A picanha estava perfeita' },
    { postId: 'seed-post-8', authorId: pedroId, text: 'Próximo tem que ter karaokê!' },
  ];

  for (const fc of feedCommentsData) {
    await prisma.feedComment.create({
      data: { postId: fc.postId, authorId: fc.authorId, text: fc.text, createdAt: daysAgo(Math.floor(Math.random() * 10)) },
    });
  }

  // Polls
  // Poll 1: "Qual próximo evento?"
  const poll1 = await prisma.poll.upsert({
    where: { postId: 'seed-post-3' },
    update: {},
    create: { postId: 'seed-post-3', question: 'Qual deve ser o próximo evento da associação?', durationDays: 7, totalVotes: 8, endsAt: daysFromNow(3) },
  });

  const poll1Options = [
    { text: 'Festival de Comida', votesCount: 3, order: 0 },
    { text: 'Torneio de Vôlei', votesCount: 2, order: 1 },
    { text: 'Workshop de Culinária', votesCount: 2, order: 2 },
    { text: 'Festa à Fantasia', votesCount: 1, order: 3 },
  ];

  const poll1OptionIds: string[] = [];
  for (const opt of poll1Options) {
    const existing = await prisma.pollOption.findFirst({ where: { pollId: poll1.id, text: opt.text } });
    if (existing) { poll1OptionIds.push(existing.id); continue; }
    const o = await prisma.pollOption.create({ data: { pollId: poll1.id, text: opt.text, votesCount: opt.votesCount, order: opt.order } });
    poll1OptionIds.push(o.id);
  }

  // Votes for poll 1
  const poll1Voters = [joaoId, mariaId, pedroId, lucasId, juliaId, rafaelId, camilaId, brunoId];
  for (let i = 0; i < poll1Voters.length; i++) {
    const optionIdx = i < 3 ? 0 : i < 5 ? 1 : i < 7 ? 2 : 3;
    await prisma.pollVote.upsert({
      where: { pollId_userId: { pollId: poll1.id, userId: poll1Voters[i]! } },
      update: {},
      create: { pollId: poll1.id, optionId: poll1OptionIds[optionIdx]!, userId: poll1Voters[i]! },
    });
  }

  // Poll 2: "Melhor horário treino?"
  const poll2 = await prisma.poll.upsert({
    where: { postId: 'seed-post-7' },
    update: {},
    create: { postId: 'seed-post-7', question: 'Qual o melhor horário para treinar?', durationDays: 5, totalVotes: 6, endsAt: daysFromNow(1) },
  });

  const poll2Options = [
    { text: 'Manhã (6h-9h)', votesCount: 3, order: 0 },
    { text: 'Tarde (12h-14h)', votesCount: 1, order: 1 },
    { text: 'Noite (18h-21h)', votesCount: 2, order: 2 },
  ];

  const poll2OptionIds: string[] = [];
  for (const opt of poll2Options) {
    const existing = await prisma.pollOption.findFirst({ where: { pollId: poll2.id, text: opt.text } });
    if (existing) { poll2OptionIds.push(existing.id); continue; }
    const o = await prisma.pollOption.create({ data: { pollId: poll2.id, text: opt.text, votesCount: opt.votesCount, order: opt.order } });
    poll2OptionIds.push(o.id);
  }

  const poll2Voters = [joaoId, mariaId, anaId, pedroId, camilaId, brunoId];
  for (let i = 0; i < poll2Voters.length; i++) {
    const optionIdx = i < 3 ? 0 : i < 4 ? 1 : 2;
    await prisma.pollVote.upsert({
      where: { pollId_userId: { pollId: poll2.id, userId: poll2Voters[i]! } },
      update: {},
      create: { pollId: poll2.id, optionId: poll2OptionIds[optionIdx]!, userId: poll2Voters[i]! },
    });
  }

  console.log(`   ✅ ${postsData.length} posts, ${feedCommentsData.length} comentários, 2 polls`);

  // ─── 16. Spaces + Bookings ─────────────────────────────
  console.log('\n🏠 Criando espaços e reservas...\n');

  const spacesData = [
    {
      id: 'seed-space-salao', name: 'Salão de Festas', description: 'Amplo salão para eventos com capacidade para 100 pessoas. Cozinha equipada, banheiros e estacionamento.', capacity: 100,
      mainImageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=400&fit=crop',
      images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=400&fit=crop'],
      fee: 200, periodType: BookingPeriodType.DAY, status: SpaceStatus.ACTIVE, minAdvanceDays: 7, maxAdvanceDays: 60, bookingIntervalMonths: 2,
    },
    {
      id: 'seed-space-churrasqueira', name: 'Churrasqueira', description: 'Espaço com churrasqueira, mesas e cadeiras para 20 pessoas. Área coberta.', capacity: 20,
      mainImageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
      images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop'],
      fee: 50, periodType: BookingPeriodType.SHIFT, status: SpaceStatus.ACTIVE,
      shifts: [{ name: 'Manhã', startTime: '08:00', endTime: '12:00' }, { name: 'Tarde', startTime: '13:00', endTime: '17:00' }, { name: 'Noite', startTime: '18:00', endTime: '22:00' }],
      minAdvanceDays: 2, maxAdvanceDays: 30, bookingIntervalMonths: 0,
    },
    {
      id: 'seed-space-quadra', name: 'Quadra Poliesportiva', description: 'Quadra coberta para futebol, vôlei e basquete. Vestiários disponíveis.', capacity: 30,
      mainImageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
      images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop'],
      fee: 0, periodType: BookingPeriodType.HOUR, status: SpaceStatus.ACTIVE,
      openingTime: '08:00', closingTime: '22:00', minDurationHours: 1,
      minAdvanceDays: 1, maxAdvanceDays: 14, bookingIntervalMonths: 0,
    },
  ];

  for (const s of spacesData) {
    await prisma.space.upsert({
      where: { id: s.id },
      update: { name: s.name },
      create: {
        id: s.id, associationId: association.id, name: s.name, description: s.description, capacity: s.capacity,
        mainImageUrl: s.mainImageUrl, images: s.images, fee: s.fee, periodType: s.periodType, status: s.status,
        shifts: (s as any).shifts || [], openingTime: (s as any).openingTime || null, closingTime: (s as any).closingTime || null,
        minDurationHours: (s as any).minDurationHours || null,
        minAdvanceDays: s.minAdvanceDays, maxAdvanceDays: s.maxAdvanceDays, bookingIntervalMonths: s.bookingIntervalMonths,
      },
    });
  }

  // Bookings
  const bookingsData = [
    { id: 'seed-booking-1', spaceId: 'seed-space-salao', userId: joaoId, date: daysFromNow(14), periodType: BookingPeriodType.DAY, status: BookingStatus.APPROVED, totalFee: 200, finalFee: 170 },
    { id: 'seed-booking-2', spaceId: 'seed-space-churrasqueira', userId: mariaId, date: daysFromNow(5), periodType: BookingPeriodType.SHIFT, shiftName: 'Tarde', shiftStart: '13:00', shiftEnd: '17:00', status: BookingStatus.PENDING, totalFee: 50, finalFee: 50 },
    { id: 'seed-booking-3', spaceId: 'seed-space-quadra', userId: pedroId, date: daysFromNow(3), periodType: BookingPeriodType.HOUR, startTime: '14:00', endTime: '16:00', status: BookingStatus.APPROVED, totalFee: 0, finalFee: 0 },
    { id: 'seed-booking-4', spaceId: 'seed-space-churrasqueira', userId: anaId, date: daysAgo(3), periodType: BookingPeriodType.SHIFT, shiftName: 'Noite', shiftStart: '18:00', shiftEnd: '22:00', status: BookingStatus.COMPLETED, totalFee: 50, finalFee: 42.5 },
    { id: 'seed-booking-5', spaceId: 'seed-space-quadra', userId: lucasId, date: daysFromNow(2), periodType: BookingPeriodType.HOUR, startTime: '18:00', endTime: '20:00', status: BookingStatus.CANCELLED, totalFee: 0, finalFee: 0 },
  ];

  for (const b of bookingsData) {
    await prisma.booking.upsert({
      where: { id: b.id },
      update: { status: b.status },
      create: {
        id: b.id, spaceId: b.spaceId, userId: b.userId, date: b.date, periodType: b.periodType,
        shiftName: (b as any).shiftName || null, shiftStart: (b as any).shiftStart || null, shiftEnd: (b as any).shiftEnd || null,
        startTime: (b as any).startTime || null, endTime: (b as any).endTime || null,
        totalFee: b.totalFee, finalFee: b.finalFee, status: b.status,
        approvedAt: b.status === BookingStatus.APPROVED || b.status === BookingStatus.COMPLETED ? daysAgo(1) : null,
        completedAt: b.status === BookingStatus.COMPLETED ? daysAgo(1) : null,
        cancelledAt: b.status === BookingStatus.CANCELLED ? daysAgo(1) : null,
      },
    });
  }

  // SpaceBlocks
  await prisma.spaceBlock.upsert({
    where: { spaceId_date: { spaceId: 'seed-space-salao', date: daysFromNow(21) } },
    update: {},
    create: { spaceId: 'seed-space-salao', date: daysFromNow(21), reason: 'Manutenção programada', createdById: adminId },
  });

  console.log(`   ✅ ${spacesData.length} espaços, ${bookingsData.length} reservas`);

  // ─── 17. PDV ───────────────────────────────────────────
  console.log('\n🖥️  Criando PDV...\n');

  const apiKey = `pdv-${crypto.randomBytes(8).toString('hex')}`;
  const apiSecret = await bcrypt.hash('pdv-secret-123', 10);

  const pdv = await prisma.pdv.upsert({
    where: { id: 'seed-pdv-cantina' },
    update: {},
    create: {
      id: 'seed-pdv-cantina', associationId: association.id, name: 'Cantina da Sede', location: 'Térreo - Recepção',
      status: PdvStatus.ACTIVE, apiKey, apiSecret,
      displayConfig: { theme: 'default', idle_timeout: 60, checkout_timeout: 300 },
    },
  });

  const pdvProducts = [
    { name: 'Água Mineral 500ml', pricePoints: 10, priceMoney: 3.00, category: 'Bebidas', stock: 100 },
    { name: 'Suco Natural 300ml', pricePoints: 20, priceMoney: 6.00, category: 'Bebidas', stock: 50 },
    { name: 'Sanduíche Natural', pricePoints: 30, priceMoney: 8.00, category: 'Lanches', stock: 30 },
    { name: 'Barra de Proteína', pricePoints: 25, priceMoney: 7.00, category: 'Lanches', stock: 40 },
    { name: 'Café Expresso', pricePoints: 15, priceMoney: 4.50, category: 'Bebidas', stock: 200 },
    { name: 'Açaí 300ml', pricePoints: 35, priceMoney: 12.00, category: 'Lanches', stock: 20 },
  ];

  for (const pp of pdvProducts) {
    const existing = await prisma.pdvProduct.findFirst({ where: { pdvId: pdv.id, name: pp.name } });
    if (!existing) {
      await prisma.pdvProduct.create({
        data: { pdvId: pdv.id, name: pp.name, pricePoints: pp.pricePoints, priceMoney: pp.priceMoney, category: pp.category, stock: pp.stock },
      });
    }
  }
  console.log(`   ✅ 1 PDV com ${pdvProducts.length} produtos`);

  // ─── 18. Support (FAQ + Tickets) ───────────────────────
  console.log('\n🎧 Criando suporte...\n');

  const faqItems = [
    { question: 'Como faço para ganhar pontos?', answer: 'Você pode ganhar pontos de várias formas:\n- **Check-in em eventos**: 50 pontos por check-in\n- **Posts diários**: 5 pontos por dia\n- **Atividades no Strava**: 5-15 pontos por km\n- **Indicação de amigos**: 500 pontos', category: 'Pontos', order: 1 },
    { question: 'Meus pontos expiram?', answer: 'Não! Seus pontos **nunca expiram**. Eles ficam disponíveis na sua carteira para usar quando quiser.', category: 'Pontos', order: 2 },
    { question: 'Como funciona a loja?', answer: 'Na loja você pode trocar seus pontos por produtos, vouchers e serviços. Alguns produtos também aceitam pagamento em dinheiro (PIX).', category: 'Loja', order: 1 },
    { question: 'Posso cancelar minha assinatura?', answer: 'Sim, você pode cancelar a qualquer momento nas configurações do app. O acesso permanece ativo até o final do período pago.', category: 'Conta', order: 1 },
    { question: 'Como usar minha carteirinha digital?', answer: 'Abra o QR Code na aba Carteirinha e apresente ao parceiro. O estabelecimento irá escanear para validar seu benefício.', category: 'Conta', order: 2 },
    { question: 'Como reservar um espaço?', answer: 'Acesse a aba Espaços, escolha o local e data desejada, e faça a solicitação. A reserva precisa ser aprovada pela administração.', category: 'Reservas', order: 1 },
  ];

  for (const faq of faqItems) {
    const existing = await prisma.fAQItem.findFirst({ where: { associationId: association.id, question: faq.question } });
    if (!existing) {
      await prisma.fAQItem.create({
        data: { associationId: association.id, question: faq.question, answer: faq.answer, category: faq.category, order: faq.order },
      });
    }
  }

  // Tickets
  const ticketsData = [
    { id: 'seed-ticket-1', code: 'TKT-001', userId: lucasId, category: TicketCategory.QUESTION, subject: 'Como conectar o Strava?', description: 'Oi, estou tentando conectar minha conta do Strava mas não aparece a opção. Podem me ajudar?', status: TicketStatus.RESOLVED },
    { id: 'seed-ticket-2', code: 'TKT-002', userId: juliaId, category: TicketCategory.BUG, subject: 'Erro ao carregar eventos', description: 'Quando abro a tela de eventos, aparece um erro e a tela fica em branco. Já tentei fechar e abrir o app.', status: TicketStatus.OPEN },
  ];

  for (const t of ticketsData) {
    await prisma.ticket.upsert({
      where: { id: t.id },
      update: { status: t.status },
      create: { id: t.id, code: t.code, userId: t.userId, associationId: association.id, category: t.category, subject: t.subject, description: t.description, status: t.status, resolvedAt: t.status === TicketStatus.RESOLVED ? daysAgo(2) : null },
    });

    // Ticket messages
    const existingMsgs = await prisma.ticketMessage.findMany({ where: { ticketId: t.id } });
    if (existingMsgs.length === 0) {
      await prisma.ticketMessage.create({
        data: { ticketId: t.id, senderType: SenderType.USER, senderId: t.userId, content: t.description, createdAt: daysAgo(5) },
      });
      if (t.status === TicketStatus.RESOLVED) {
        await prisma.ticketMessage.create({
          data: { ticketId: t.id, senderType: SenderType.SUPPORT, senderId: adminId, senderName: 'Suporte A-hub', content: 'Olá! Para conectar o Strava, vá em Perfil > Integrações > Strava. Se o botão não aparecer, tente atualizar o app para a última versão. Qualquer dúvida, estamos aqui!', createdAt: daysAgo(4) },
        });
        await prisma.ticketMessage.create({
          data: { ticketId: t.id, senderType: SenderType.USER, senderId: t.userId, content: 'Funcionou! Obrigado pela ajuda 👍', createdAt: daysAgo(3) },
        });
      }
    }
  }
  console.log(`   ✅ ${faqItems.length} FAQs, ${ticketsData.length} tickets`);

  // ─── DONE ──────────────────────────────────────────────
  console.log('\n🎉 Seed completo finalizado!\n');
  console.log('📋 Credenciais de teste:');
  console.log('   ┌───────────────────────┬─────────────┬───────┬────────────┐');
  console.log('   │ Email                 │ Senha       │ Role  │ Plano      │');
  console.log('   ├───────────────────────┼─────────────┼───────┼────────────┤');

  const planLabels: Record<string, string> = {
    [joaoId]: 'Premium', [pedroId]: 'Premium', [anaId]: 'Gold', [camilaId]: 'Gold', [juliaId]: 'Basic',
  };

  for (const u of TEST_USERS) {
    const uid = users[u.email]!;
    const plan = planLabels[uid] || '-';
    console.log(`   │ ${u.email.padEnd(21)} │ ${u.password.padEnd(11)} │ ${u.role.padEnd(5)} │ ${plan.padEnd(10)} │`);
  }
  console.log('   └───────────────────────┴─────────────┴───────┴────────────┘');

  console.log('\n📊 Dados criados:');
  console.log('   • 10 usuários (1 admin + 9 membros)');
  console.log('   • 3 planos de assinatura (Basic, Premium, Gold)');
  console.log('   • 5 assinaturas ativas');
  console.log('   • 10 badges, 13 conquistas de usuários');
  console.log('   • 9 carteirinhas digitais');
  console.log('   • 8 parceiros em 8 categorias');
  console.log('   • 6 eventos com confirmações, check-ins e comentários');
  console.log('   • 10 notificações');
  console.log('   • 4 conversas (2 diretas + 2 grupos) com mensagens');
  console.log('   • 12 produtos com imagens, variantes e specs');
  console.log('   • 8 pedidos com itens e reviews');
  console.log('   • 6 stories');
  console.log('   • 8 posts com likes, comentários e 2 enquetes');
  console.log('   • 3 espaços com 5 reservas');
  console.log('   • 1 PDV com 6 produtos');
  console.log('   • 6 FAQs e 2 tickets de suporte');
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
