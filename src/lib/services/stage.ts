import { getOnboardingAsAService } from '@/lib/api/endpoints';
import { StageCreate, StageResponse, StageUpdate } from '@/lib/api/schemas';

const api = getOnboardingAsAService();

class StageService {
  public async listStages(flowId: string): Promise<StageResponse[]> {
    return api.listStagesApiStagesFlowsFlowIdStagesGet(flowId);
  }

  public async createStage(
    flowId: string,
    data: StageCreate,
  ): Promise<StageResponse> {
    return api.createStageApiStagesFlowsFlowIdStagesPost(flowId, data);
  }

  public async createStageFromTemplate(
    flowId: string,
    templateId: string,
  ): Promise<StageResponse> {
    return api.createStageFromTemplateApiStagesFlowsFlowIdStagesTemplateTemplateIdPost(flowId, templateId);
  }

  public async updateStage(
    flowId: string,
    stageId: string,
    data: StageUpdate,
  ): Promise<StageResponse> {
    return api.updateStageApiStagesFlowsFlowIdStagesStageIdPatch(
      flowId,
      stageId,
      data,
    );
  }

  public async deleteStage(flowId: string, stageId: string): Promise<void> {
    await api.deleteStageApiStagesFlowsFlowIdStagesStageIdDelete(flowId, stageId);
  }
}

export const stageService = new StageService();