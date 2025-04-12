import { Metadata } from 'next';
import EditCastClient from './edit-cast-client';

export const metadata: Metadata = {
  title: 'Edit Cast',
};

export default async function EditCastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCastClient id={id} />;
}
