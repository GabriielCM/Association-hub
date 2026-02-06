import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
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
