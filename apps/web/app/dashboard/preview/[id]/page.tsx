import { Metadata } from 'next';
import PreviewCastClient from './preview-cast-client';

export const metadata: Metadata = {
  title: 'Preview Cast',
};

export default async function PreviewCastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PreviewCastClient id={id} />;
}
