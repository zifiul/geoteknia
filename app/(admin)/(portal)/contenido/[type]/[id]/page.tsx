import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { ContentEditor } from '@/components/organisms/admin/cms/ContentEditor';
import { loadCmsEditorPage } from '@/lib/cms/editor/load-cms-editor-page';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { can } from '@/lib/auth/rbac';
import { getPortalSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Editor de contenido — Portal Geoteknia',
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ type: string; id: string }>;
};

export default async function CmsContentEditorPage({ params }: PageProps) {
  const { type, id } = await params;
  const session = await runWithPortalReadAccess(() => getPortalSession());

  if (!can(session, 'content.read')) {
    redirect('/admin/forbidden');
  }

  const page = await loadCmsEditorPage(type, id, session);
  if (!page) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      <ContentEditor page={page} />
    </div>
  );
}
