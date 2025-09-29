import { getOnboardingAsAService } from '@/lib/api/endpoints';
import { FlowCreate, FlowResponse, FlowUpdate } from '@/lib/api/schemas';

const api = getOnboardingAsAService();

class FlowService {
  public async listFlows(): Promise<FlowResponse[]> {
    return api.listFlowsApiFlowsGet();
  }

  public async createFlow(data: FlowCreate): Promise<FlowResponse> {
    return api.createFlowApiFlowsPost(data);
  }

  public async getFlow(id: string): Promise<FlowResponse> {
    return api.getFlowApiFlowsFlowIdGet(id);
  }

  public async updateFlow(id: string, data: FlowUpdate): Promise<FlowResponse> {
    return api.updateFlowApiFlowsFlowIdPatch(id, data);
  }
}

export const flowService = new FlowService();