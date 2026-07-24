'use server';

import { revalidatePath } from 'next/cache';

import { withPermission } from '@/lib/auth/rbac';
import {
  createAccreditation,
  softDeleteAccreditation,
  updateAccreditation,
} from '@/lib/content/accreditations';
import {
  createBlogCategory,
  createBlogPost,
  createFaq,
  createFaqGroup,
  softDeleteBlogCategory,
  softDeleteBlogPost,
  softDeleteFaq,
  softDeleteFaqGroup,
  updateBlogCategory,
  updateBlogPost,
  updateFaq,
  updateFaqGroup,
} from '@/lib/content/blog-faqs';
import {
  createCaseStudy,
  softDeleteCaseStudy,
  updateCaseStudy,
} from '@/lib/content/case-studies';
import {
  runContentAction,
  type ContentActionResult,
} from '@/lib/content/content-action-result';
import {
  createCalculatorRule,
  createContactChannel,
  softDeleteCalculatorRule,
  softDeleteContactChannel,
  updateCalculatorRule,
  updateContactChannel,
  updateOrganizationProfile,
} from '@/lib/content/config';
import {
  createGeoZone,
  softDeleteGeoZone,
  updateGeoZone,
} from '@/lib/content/geo-zones';
import {
  createLeadMagnet,
  softDeleteLeadMagnet,
  updateLeadMagnet,
} from '@/lib/content/lead-magnets';
import {
  createMediaAsset,
  softDeleteMediaAsset,
  updateMediaAsset,
} from '@/lib/content/media-assets';
import { withAdmin } from '@/lib/content/require-admin';
import {
  createService,
  getServiceById,
  listServices,
  softDeleteService,
  updateService,
} from '@/lib/content/services';
import {
  createServiceZonePage,
  softDeleteServiceZonePage,
  updateServiceZonePage,
} from '@/lib/content/service-zone-pages';
import {
  createMachinery,
  createTeamMember,
  softDeleteMachinery,
  softDeleteTeamMember,
  updateMachinery,
  updateTeamMember,
} from '@/lib/content/team-machinery';

function revalidateContenido() {
  revalidatePath('/admin/contenido');
}

export const createServiceAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => {
      const data = await createService(_user, raw);
      revalidateContenido();
      return data;
    });
  },
);

export const updateServiceAction = withPermission(
  'content.update',
  async (
    _user,
    serviceId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () => {
      await updateService(_user, serviceId, raw);
      revalidateContenido();
    });
  },
);

export const deleteServiceAction = withPermission(
  'content.delete',
  async (_user, serviceId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => {
      await softDeleteService(_user, serviceId);
      revalidateContenido();
    });
  },
);

export const getServiceAction = withPermission(
  'content.read',
  async (_user, serviceId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => getServiceById(serviceId));
  },
);

export const listServicesAction = withPermission(
  'content.read',
  async (_user, raw?: unknown): Promise<ContentActionResult> => {
    return runContentAction(async () => {
      const params =
        raw && typeof raw === 'object'
          ? (raw as { skip?: number; take?: number })
          : undefined;
      return listServices(params);
    });
  },
);

export const createGeoZoneAction = withPermission(
  'content.create',
  async (
    _user,
    raw: unknown,
  ): Promise<ContentActionResult<{ id: string; warning?: string }>> => {
    return runContentAction(async () => {
      const data = await createGeoZone(_user, raw);
      revalidateContenido();
      return data;
    });
  },
);

export const updateGeoZoneAction = withPermission(
  'content.update',
  async (
    _user,
    geoZoneId: string,
    raw: unknown,
  ): Promise<ContentActionResult<{ warning?: string }>> => {
    return runContentAction(async () => {
      const data = await updateGeoZone(_user, geoZoneId, raw);
      revalidateContenido();
      return data;
    });
  },
);

export const deleteGeoZoneAction = withPermission(
  'content.delete',
  async (_user, geoZoneId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => {
      await softDeleteGeoZone(_user, geoZoneId);
      revalidateContenido();
    });
  },
);

export const createServiceZonePageAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => {
      const data = await createServiceZonePage(_user, raw);
      revalidateContenido();
      return data;
    });
  },
);

export const updateServiceZonePageAction = withPermission(
  'content.update',
  async (
    _user,
    pageId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () => {
      await updateServiceZonePage(_user, pageId, raw);
      revalidateContenido();
    });
  },
);

export const deleteServiceZonePageAction = withPermission(
  'content.delete',
  async (_user, pageId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => {
      await softDeleteServiceZonePage(_user, pageId);
      revalidateContenido();
    });
  },
);

export const createMediaAssetAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createMediaAsset(_user, raw));
  },
);

export const updateMediaAssetAction = withPermission(
  'content.update',
  async (_user, mediaId: string, raw: unknown): Promise<ContentActionResult> => {
    return runContentAction(async () => updateMediaAsset(_user, mediaId, raw));
  },
);

export const deleteMediaAssetAction = withPermission(
  'content.delete',
  async (_user, mediaId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => softDeleteMediaAsset(_user, mediaId));
  },
);

export const createCaseStudyAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createCaseStudy(_user, raw));
  },
);

export const updateCaseStudyAction = withPermission(
  'content.update',
  async (
    _user,
    caseStudyId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () => updateCaseStudy(_user, caseStudyId, raw));
  },
);

export const deleteCaseStudyAction = withPermission(
  'content.delete',
  async (_user, caseStudyId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => softDeleteCaseStudy(_user, caseStudyId));
  },
);

export const createTeamMemberAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createTeamMember(_user, raw));
  },
);

export const updateTeamMemberAction = withPermission(
  'content.update',
  async (
    _user,
    teamMemberId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () => updateTeamMember(_user, teamMemberId, raw));
  },
);

export const deleteTeamMemberAction = withPermission(
  'content.delete',
  async (_user, teamMemberId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => softDeleteTeamMember(_user, teamMemberId));
  },
);

export const createMachineryAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createMachinery(_user, raw));
  },
);

export const updateMachineryAction = withPermission(
  'content.update',
  async (
    _user,
    machineryId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () => updateMachinery(_user, machineryId, raw));
  },
);

export const deleteMachineryAction = withPermission(
  'content.delete',
  async (_user, machineryId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => softDeleteMachinery(_user, machineryId));
  },
);

export const createAccreditationAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createAccreditation(_user, raw));
  },
);

export const updateAccreditationAction = withPermission(
  'content.update',
  async (
    _user,
    accreditationId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () =>
      updateAccreditation(_user, accreditationId, raw),
    );
  },
);

export const deleteAccreditationAction = withPermission(
  'content.delete',
  async (_user, accreditationId: string): Promise<ContentActionResult> => {
    return runContentAction(async () =>
      softDeleteAccreditation(_user, accreditationId),
    );
  },
);

export const createBlogCategoryAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createBlogCategory(_user, raw));
  },
);

export const updateBlogCategoryAction = withPermission(
  'content.update',
  async (
    _user,
    categoryId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () => updateBlogCategory(_user, categoryId, raw));
  },
);

export const deleteBlogCategoryAction = withPermission(
  'content.delete',
  async (_user, categoryId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => softDeleteBlogCategory(_user, categoryId));
  },
);

export const createBlogPostAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createBlogPost(_user, raw));
  },
);

export const updateBlogPostAction = withPermission(
  'content.update',
  async (
    _user,
    blogPostId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () => updateBlogPost(_user, blogPostId, raw));
  },
);

export const deleteBlogPostAction = withPermission(
  'content.delete',
  async (_user, blogPostId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => softDeleteBlogPost(_user, blogPostId));
  },
);

export const createFaqGroupAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createFaqGroup(_user, raw));
  },
);

export const updateFaqGroupAction = withPermission(
  'content.update',
  async (
    _user,
    faqGroupId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () => updateFaqGroup(_user, faqGroupId, raw));
  },
);

export const deleteFaqGroupAction = withPermission(
  'content.delete',
  async (_user, faqGroupId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => softDeleteFaqGroup(_user, faqGroupId));
  },
);

export const createFaqAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createFaq(_user, raw));
  },
);

export const updateFaqAction = withPermission(
  'content.update',
  async (_user, faqId: string, raw: unknown): Promise<ContentActionResult> => {
    return runContentAction(async () => updateFaq(_user, faqId, raw));
  },
);

export const deleteFaqAction = withPermission(
  'content.delete',
  async (_user, faqId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => softDeleteFaq(_user, faqId));
  },
);

export const createLeadMagnetAction = withPermission(
  'content.create',
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createLeadMagnet(_user, raw));
  },
);

export const updateLeadMagnetAction = withPermission(
  'content.update',
  async (
    _user,
    leadMagnetId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () => updateLeadMagnet(_user, leadMagnetId, raw));
  },
);

export const deleteLeadMagnetAction = withPermission(
  'content.delete',
  async (_user, leadMagnetId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => softDeleteLeadMagnet(_user, leadMagnetId));
  },
);

export const createCalculatorRuleAction = withAdmin(
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createCalculatorRule(_user, raw));
  },
);

export const updateCalculatorRuleAction = withAdmin(
  async (
    _user,
    ruleId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () => updateCalculatorRule(_user, ruleId, raw));
  },
);

export const deleteCalculatorRuleAction = withAdmin(
  async (_user, ruleId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => softDeleteCalculatorRule(_user, ruleId));
  },
);

export const updateOrganizationProfileAction = withAdmin(
  async (
    _user,
    profileId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () =>
      updateOrganizationProfile(_user, profileId, raw),
    );
  },
);

export const createContactChannelAction = withAdmin(
  async (_user, raw: unknown): Promise<ContentActionResult<{ id: string }>> => {
    return runContentAction(async () => createContactChannel(_user, raw));
  },
);

export const updateContactChannelAction = withAdmin(
  async (
    _user,
    channelId: string,
    raw: unknown,
  ): Promise<ContentActionResult> => {
    return runContentAction(async () => updateContactChannel(_user, channelId, raw));
  },
);

export const deleteContactChannelAction = withAdmin(
  async (_user, channelId: string): Promise<ContentActionResult> => {
    return runContentAction(async () => softDeleteContactChannel(_user, channelId));
  },
);
