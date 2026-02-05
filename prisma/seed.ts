import { PrismaClient, ProjectStatus, ScriptType, TaskStatus, TaskPriority, BudgetCategory, TeamRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Crea utente demo
  const user = await prisma.user.upsert({
    where: { email: 'demo@videopreprod.ai' },
    update: {},
    create: {
      email: 'demo@videopreprod.ai',
      name: 'Demo User',
      role: 'ADMIN',
    },
  })
  console.log('👤 Created user:', user.email)

  // Crea progetto demo
  const project = await prisma.project.create({
    data: {
      name: 'Spot Pubblicitario Estate 2024',
      description: 'Campagna pubblicitaria per nuova linea estiva con focus su giovani 18-35',
      status: ProjectStatus.PRE_PRODUCTION,
      totalBudget: 50000,
      currency: 'EUR',
      deadline: new Date('2024-06-30'),
      genre: 'Pubblicità',
      duration: 30,
      format: '16:9',
      target: 'Giovani 18-35',
      userId: user.id,
      // Team
      teamMembers: {
        create: [
          { role: TeamRole.DIRECTOR, name: 'Marco Rossi', email: 'marco@studio.it', dailyRate: 800 },
          { role: TeamRole.DOP, name: 'Laura Bianchi', email: 'laura@studio.it', dailyRate: 600 },
          { role: TeamRole.PRODUCER, name: 'Giuseppe Verdi', email: 'giuseppe@studio.it', dailyRate: 500 },
        ],
      },
      // Tasks
      tasks: {
        create: [
          { title: 'Finalizzare script', status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, dueDate: new Date('2024-03-01') },
          { title: 'Scout location spiaggia', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDate: new Date('2024-03-15') },
          { title: 'Casting protagonista', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDate: new Date('2024-03-20') },
          { title: 'Prenotazione equipaggiamento', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDate: new Date('2024-03-25') },
        ],
      },
      // Budget
      budgets: {
        create: [
          { category: BudgetCategory.PRODUCTION, item: 'Noleggio camera ARRI', estimated: 3000, status: 'ESTIMATED' },
          { category: BudgetCategory.TALENT, item: 'Attore protagonista', estimated: 5000, status: 'ESTIMATED' },
          { category: BudgetCategory.LOCATIONS, item: 'Permesso spiaggia', estimated: 1500, status: 'ESTIMATED' },
          { category: BudgetCategory.CREW, item: 'Giornate crew (5 persone)', estimated: 8000, quantity: 5, unitCost: 1600, status: 'ESTIMATED' },
          { category: BudgetCategory.POST_PRODUCTION, item: 'Editing e color', estimated: 4000, status: 'ESTIMATED' },
        ],
      },
      // Locations
      locations: {
        create: [
          {
            name: 'Spiaggia del Poetto',
            city: 'Cagliari',
            country: 'Italia',
            type: 'EXTERIOR',
            status: 'SCOUTING',
            description: 'Spiaggia sabbiosa con vista mare aperto',
            amenities: ['parking', 'power', 'bathrooms'],
            contactName: 'Comune di Cagliari',
            contactEmail: 'sport@comune.cagliari.it',
          },
        ],
      },
    },
  })
  console.log('🎬 Created project:', project.name)

  // Crea script con scene
  const script = await prisma.script.create({
    data: {
      title: 'Script Principale',
      type: ScriptType.SCREENPLAY,
      projectId: project.id,
      logline: 'Un giovane scopre la libertà attraverso un nuovo prodotto rivoluzionario',
      content: 'FADE IN:\n\nINT. SPIAGGIA - GIORNO\n\nIl sole splende sul mare cristallino...',
      scenes: {
        create: [
          {
            number: 1,
            heading: 'INT. CASA - MATTINO',
            content: 'Il protagonista si sveglia e guarda il telefono...',
            location: 'Casa protagonista',
            timeOfDay: 'Mattino',
            estimatedDuration: 15,
            shots: {
              create: [
                { number: '1A', description: 'Wide shot camera da letto', shotType: 'WIDE' },
                { number: '1B', description: 'Close-up occhi protagonista', shotType: 'CU' },
              ],
            },
          },
          {
            number: 2,
            heading: 'EXT. SPIAGGIA - GIORNO',
            content: 'Il protagonista cammina lungo la spiaggia...',
            location: 'Spiaggia del Poetto',
            timeOfDay: 'Mezzogiorno',
            estimatedDuration: 30,
            shots: {
              create: [
                { number: '2A', description: 'Tracking shot lungo la riva', shotType: 'WIDE', movement: 'TRACKING' },
                { number: '2B', description: 'Drone shot dall\'alto', shotType: 'WIDE', equipment: 'DRONE' },
              ],
            },
          },
        ],
      },
    },
  })
  console.log('📝 Created script:', script.title)

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
