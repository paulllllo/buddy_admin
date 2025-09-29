import { getOnboardingAsAService } from '../api/endpoints';
import type { 
  ContentTypeResponse, 
  ContentValidationResponse
} from '../api/schemas';
import type { GetContentTypeConfigApiContentTypesNameConfigGetResult } from '../api/endpoints';

const api = getOnboardingAsAService();

export class ContentTypeService {
  /**
   * List all available content types
   */
  public static async listContentTypes(): Promise<ContentTypeResponse[]> {
    return api.listContentTypesApiContentTypesGet();
  }

  /**
   * Get a specific content type by name
   */
  public static async getContentType(name: string): Promise<ContentTypeResponse> {
    return api.getContentTypeApiContentTypesNameGet(name);
  }

  /**
   * Get the default configuration for a content type
   */
  public static async getContentTypeConfig(name: string): Promise<GetContentTypeConfigApiContentTypesNameConfigGetResult> {
    return api.getContentTypeConfigApiContentTypesNameConfigGet(name) as GetContentTypeConfigApiContentTypesNameConfigGetResult;
  }

  /**
   * Validate content against a content type
   */
  public static async validateContent(data: {
    type: string;
    config: any;
    content: any;
  }): Promise<ContentValidationResponse> {
    return api.validateContentApiContentTypesValidatePost(data);
  }
}
