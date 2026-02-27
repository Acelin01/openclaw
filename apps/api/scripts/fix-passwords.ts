import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function main() {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, password: true } })
    const targetHash = await bcrypt.hash('123123', 10)
    const updates: string[] = []

    for (const u of users) {
      const p = u.password || ''
      const needsFix = p === '123123' || p.length < 60 || !p.startsWith('$2')
      if (needsFix) {
        await prisma.user.update({ where: { id: u.id }, data: { password: targetHash } })
        updates.push(u.email)
      }
    }

    console.log('Fixed users:', updates)
  } finally {
    await (prisma as any).$disconnect()
  }
}

main().catch(err => { console.error(err); process.exit(1) })

