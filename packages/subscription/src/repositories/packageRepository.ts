import type { SubscriptionPackage, CreatePackageData } from "../types/package.types";

export class PackageRepository {
  constructor(private db: any) {}

  async findActive(): Promise<SubscriptionPackage[]> {
    const packages = await this.db.subscriptionPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return packages.map(this.mapToDomain);
  }

  async findById(id: string): Promise<SubscriptionPackage | null> {
    const pkg = await this.db.subscriptionPackage.findUnique({
      where: { id },
    });

    return pkg ? this.mapToDomain(pkg) : null;
  }

  async create(data: CreatePackageData): Promise<SubscriptionPackage> {
    const pkg = await this.db.subscriptionPackage.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type.toUpperCase(),
        price: data.price,
        currency: data.currency || "CNY",
        durationDays: data.durationDays,
        features: data.features,
        aiChatQuota: data.aiChatQuota,
        priorityMatchQuota: data.priorityMatchQuota,
        sortOrder: data.sortOrder || 0,
      },
    });

    return this.mapToDomain(pkg);
  }

  async update(id: string, data: Partial<CreatePackageData>): Promise<SubscriptionPackage | null> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type.toUpperCase();
    if (data.price !== undefined) updateData.price = data.price;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.durationDays !== undefined) updateData.durationDays = data.durationDays;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.aiChatQuota !== undefined) updateData.aiChatQuota = data.aiChatQuota;
    if (data.priorityMatchQuota !== undefined)
      updateData.priorityMatchQuota = data.priorityMatchQuota;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const pkg = await this.db.subscriptionPackage.update({
      where: { id },
      data: updateData,
    });

    return this.mapToDomain(pkg);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db.subscriptionPackage.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private mapToDomain(prismaPackage: any): SubscriptionPackage {
    return {
      id: prismaPackage.id,
      name: prismaPackage.name,
      description: prismaPackage.description,
      type: prismaPackage.type.toLowerCase() as any,
      price: Number(prismaPackage.price),
      currency: prismaPackage.currency,
      durationDays: prismaPackage.durationDays,
      features: prismaPackage.features,
      aiChatQuota: prismaPackage.aiChatQuota,
      priorityMatchQuota: prismaPackage.priorityMatchQuota,
      isActive: prismaPackage.isActive,
      sortOrder: prismaPackage.sortOrder,
      createdAt: prismaPackage.createdAt,
      updatedAt: prismaPackage.updatedAt,
    };
  }
}
