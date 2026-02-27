import type { SubscriptionPackage, CreatePackageData, PackageType } from "../types/package.types";
import type { CacheService } from "./types";

interface PackageRepository {
  findActive(): Promise<SubscriptionPackage[]>;
  findById(id: string): Promise<SubscriptionPackage | null>;
  create(data: CreatePackageData): Promise<SubscriptionPackage>;
  update(id: string, data: Partial<CreatePackageData>): Promise<SubscriptionPackage | null>;
  delete(id: string): Promise<boolean>;
}

export class PackageService {
  constructor(
    private packageRepo: PackageRepository,
    private cacheService: CacheService,
  ) {}

  async getActivePackages(): Promise<SubscriptionPackage[]> {
    const cacheKey = "active_packages";
    const cached = await this.cacheService.get<SubscriptionPackage[]>(cacheKey);
    if (cached) return cached;

    const packages = await this.packageRepo.findActive();
    await this.cacheService.set(cacheKey, packages, 300); // 5分钟缓存
    return packages;
  }

  async getPackageById(id: string): Promise<SubscriptionPackage | null> {
    return await this.packageRepo.findById(id);
  }

  async createPackage(data: CreatePackageData): Promise<SubscriptionPackage> {
    const pkg = await this.packageRepo.create(data);
    await this.cacheService.del("active_packages"); // 清除缓存
    return pkg;
  }

  async updatePackage(
    id: string,
    data: Partial<CreatePackageData>,
  ): Promise<SubscriptionPackage | null> {
    const pkg = await this.packageRepo.update(id, data);
    await this.cacheService.del("active_packages");
    return pkg;
  }

  async deletePackage(id: string): Promise<boolean> {
    const result = await this.packageRepo.delete(id);
    await this.cacheService.del("active_packages");
    return result;
  }

  async validatePackage(packageId: string): Promise<boolean> {
    const pkg = await this.getPackageById(packageId);
    return pkg !== null && pkg.isActive;
  }
}
