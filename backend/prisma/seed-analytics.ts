import { PrismaClient, Status, Priority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = '8dea11a9-0aa7-41f1-838b-7b47d2c046b7'; // Current demo user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        console.error('User not found. Please run with a valid user ID.');
        return;
    }

    console.log('Seeding realistic analytics data for user:', user.email);

    const now = new Date();
    const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    // Create 80 tasks over the last 90 days to provide nice density
    for (let i = 0; i < 80; i++) {
        const creationDate = new Date(now);
        creationDate.setDate(creationDate.getDate() - Math.floor(Math.random() * 90));

        const priority = priorities[Math.floor(Math.random() * priorities.length)];

        // Randomly decide if task is completed or still open
        const isCompleted = Math.random() > 0.15; // 85% completion rate for healthy charts

        const task = await prisma.task.create({
            data: {
                title: `Task #${i + 1} - ${priority} Focus`,
                description: 'Generated task for analytics realism.',
                status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
                priority: priority,
                creatorId: userId,
                assignedToId: userId,
                createdAt: creationDate,
                updatedAt: creationDate,
                dueDate: new Date(creationDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            }
        });

        // Add history: Created
        await prisma.taskHistory.create({
            data: {
                taskId: task.id,
                userId: userId,
                action: 'created',
                oldValue: null,
                newValue: 'TODO',
                createdAt: creationDate
            }
        });

        // Move to IN_PROGRESS
        const progressDate = new Date(creationDate);
        progressDate.setHours(progressDate.getHours() + Math.floor(Math.random() * 24) + 2);

        if (progressDate < now) {
            await prisma.taskHistory.create({
                data: {
                    taskId: task.id,
                    userId: userId,
                    action: 'status_changed',
                    oldValue: 'TODO',
                    newValue: 'IN_PROGRESS',
                    createdAt: progressDate
                }
            });
        }

        if (isCompleted) {
            // Move to COMPLETED
            const completeDate = new Date(progressDate);
            completeDate.setHours(completeDate.getHours() + Math.floor(Math.random() * 120) + 12); // Takes 0.5 to 5 days

            if (completeDate < now) {
                await prisma.taskHistory.create({
                    data: {
                        taskId: task.id,
                        userId: userId,
                        action: 'status_changed',
                        oldValue: 'IN_PROGRESS',
                        newValue: 'COMPLETED',
                        createdAt: completeDate
                    }
                });

                await prisma.task.update({
                    where: { id: task.id },
                    data: { updatedAt: completeDate, status: 'COMPLETED' }
                });
            }
        }
    }

    console.log('Successfully seeded 80 tasks with historical data.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
