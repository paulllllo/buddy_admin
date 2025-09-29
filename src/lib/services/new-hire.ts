import { getOnboardingAsAService } from '@/lib/api/endpoints';
import { NewHireCreate, NewHireResponse } from '@/lib/api/schemas';

const api = getOnboardingAsAService();

class NewHireService {
  public async listNewHires(): Promise<NewHireResponse[]> {
    return api.listNewHiresApiNewHiresGet();
  }

  public async createNewHire(data: NewHireCreate): Promise<NewHireResponse> {
    return api.createNewHireApiNewHiresPost(data);
  }

  public async getNewHire(id: string): Promise<NewHireResponse> {
    return api.getNewHireApiNewHiresNewHireIdGet(id);
  }
}

export const newHireService = new NewHireService();