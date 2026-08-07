'use client';

import { CmsTiptapUiEditor } from '@/components/organisms/admin/cms/cms-tiptap-ui-editor';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function BodyEditor(props: Props) {
  return <CmsTiptapUiEditor {...props} />;
}
