import { getOnboardingAsAService } from '@/lib/api/endpoints';
import {
  ContentBlockCreate,
  ContentBlockResponse,
  ContentBlockReorder,
  UpdateContentBlockApiContentBlocksContentBlocksContentBlockIdPutBody,
} from '@/lib/api/schemas';

const api = getOnboardingAsAService();

class ContentBlockService {
  public async listContentBlocks(
    stageId: string,
  ): Promise<ContentBlockResponse[]> {
    return api.listContentBlocksApiContentBlocksStagesStageIdContentBlocksGet(stageId);
  }

  public async getContentBlock(contentBlockId: string): Promise<ContentBlockResponse> {
    return api.getContentBlockApiContentBlocksContentBlocksContentBlockIdGet(contentBlockId);
  }

  public async createContentBlock(
    stageId: string,
    data: ContentBlockCreate,
  ): Promise<ContentBlockResponse> {
    return api.createContentBlockApiContentBlocksStagesStageIdContentBlocksPost(
      stageId,
      data,
    );
  }

  public async updateContentBlock(
    contentBlockId: string,
    data: UpdateContentBlockApiContentBlocksContentBlocksContentBlockIdPutBody,
  ): Promise<ContentBlockResponse> {
    return api.updateContentBlockApiContentBlocksContentBlocksContentBlockIdPut(
      contentBlockId,
      data,
    );
  }

  public async deleteContentBlock(contentBlockId: string): Promise<void> {
    await api.deleteContentBlockApiContentBlocksContentBlocksContentBlockIdDelete(
      contentBlockId,
    );
  }

  public async reorderContentBlocks(
    stageId: string,
    data: ContentBlockReorder,
  ): Promise<ContentBlockResponse[]> {
    return api.reorderContentBlocksApiContentBlocksStagesStageIdContentBlocksReorderPost(
      stageId,
      data,
    );
  }
}

export const contentBlockService = new ContentBlockService();