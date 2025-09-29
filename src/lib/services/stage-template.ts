import { getOnboardingAsAService } from '@/lib/api/endpoints';
import type { StageTemplateResponse } from '@/lib/api/schemas';

const api = getOnboardingAsAService();

class StageTemplateService {
	public async listTemplates(): Promise<StageTemplateResponse[]> {
		return api.listStageTemplatesApiStageTemplatesGet();
	}

	public async getTemplatesByType(templateType: string): Promise<StageTemplateResponse[]> {
		return api.getTemplatesByTypeApiStageTemplatesTypeTemplateTypeGet(templateType);
	}
}

export const stageTemplateService = new StageTemplateService();
