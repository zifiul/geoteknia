'use client';

import type { WorkflowStatus } from '@prisma/client';
import { useState } from 'react';

import { RevisionHistory, type RevisionHistoryItem } from '@/components/organisms/admin/cms/RevisionHistory';
import { WorkflowActions } from '@/components/organisms/admin/cms/WorkflowActions';
import { WorkflowStepper } from '@/components/organisms/admin/cms/WorkflowStepper';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';

type Props = {
  contentType: EditorialContentType;
  contentId: string;
  workflowStatus: WorkflowStatus;
  scheduledPublishAt: string | null;
  publicPath: string | null;
  canUpdate: boolean;
  canPublish: boolean;
  revisions: RevisionHistoryItem[];
};

export function EditorialWorkflowPanel({
  contentType,
  contentId,
  workflowStatus,
  scheduledPublishAt,
  publicPath,
  canUpdate,
  canPublish,
  revisions,
}: Props) {
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [workflowSuccess, setWorkflowSuccess] = useState<string | null>(null);

  return (
    <div className="mb-6 space-y-4" data-testid="cms-editorial-workflow">
      <WorkflowStepper status={workflowStatus} />
      {workflowError ? (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          {workflowError}
        </p>
      ) : null}
      {workflowSuccess ? (
        <p role="status" className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-900">
          {workflowSuccess}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(280px,360px)]">
        <WorkflowActions
          contentType={contentType}
          contentId={contentId}
          workflowStatus={workflowStatus}
          scheduledPublishAt={scheduledPublishAt}
          publicPath={publicPath}
          canUpdate={canUpdate}
          canPublish={canPublish}
          onFeedback={({ error, success }) => {
            setWorkflowError(error ?? null);
            setWorkflowSuccess(success ?? null);
          }}
        />
        <RevisionHistory revisions={revisions} />
      </div>
    </div>
  );
}
