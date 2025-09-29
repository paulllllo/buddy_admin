import { getOnboardingAsAService } from '@/lib/api/endpoints';
import { CompanyUpdate, CompanyResponse } from '@/lib/api/schemas';

const api = getOnboardingAsAService();

class CompanyService {
  public async getCompanyInfo(): Promise<CompanyResponse> {
    return api.getCompanyInfoApiCompaniesMeGet();
  }

  public async updateCompanyInfo(
    data: CompanyUpdate,
  ): Promise<CompanyResponse> {
    return api.updateCompanyInfoApiCompaniesMePatch(data);
  }
}

export const companyService = new CompanyService();