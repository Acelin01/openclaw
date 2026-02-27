import { getPrisma } from './index.js';

export async function getSharedEmployees() {
  const prisma = getPrisma();
  return prisma.sharedEmployee.findMany({
    include: {
      skills: true,
      assignments: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getSharedEmployeeById(id: string) {
  const prisma = getPrisma();
  return prisma.sharedEmployee.findUnique({
    where: { id },
    include: {
      skills: true,
      assignments: true,
    },
  });
}

export async function createSharedEmployee(data: any) {
  const prisma = getPrisma();
  const { skills, assignments, ...rest } = data;
  return prisma.sharedEmployee.create({
    data: {
      ...rest,
      skills: skills ? {
        create: skills,
      } : undefined,
      assignments: assignments ? {
        create: assignments,
      } : undefined,
    },
    include: {
      skills: true,
      assignments: true,
    },
  });
}

export async function updateSharedEmployee(id: string, data: any) {
  const prisma = getPrisma();
  const { skills, assignments, ...rest } = data;
  
  // Handle skills update (simple clear and recreate for now)
  if (skills) {
    await prisma.sharedEmployeeSkill.deleteMany({
      where: { employeeId: id },
    });
  }
  
  // Handle assignments update
  if (assignments) {
    await prisma.sharedEmployeeAssignment.deleteMany({
      where: { employeeId: id },
    });
  }

  return prisma.sharedEmployee.update({
    where: { id },
    data: {
      ...rest,
      skills: skills ? {
        create: skills,
      } : undefined,
      assignments: assignments ? {
        create: assignments,
      } : undefined,
    },
    include: {
      skills: true,
      assignments: true,
    },
  });
}

export async function deleteSharedEmployee(id: string) {
  const prisma = getPrisma();
  return prisma.sharedEmployee.delete({
    where: { id },
  });
}

export async function getSharedEmployeeStats() {
  const prisma = getPrisma();
  const [total, available, assignments] = await Promise.all([
    prisma.sharedEmployee.count(),
    prisma.sharedEmployee.count({ where: { status: 'AVAILABLE' } }),
    prisma.sharedEmployeeAssignment.count(),
  ]);

  const totalSkills = await prisma.sharedEmployeeSkill.count();

  return {
    totalEmployees: total,
    availableEmployees: available,
    totalAssignments: assignments,
    totalSkills: totalSkills,
  };
}
