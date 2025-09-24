import PublicationForm from '@/components/form/PublicationForm';
import { GET_PUBLICATION, UPDATE_PUBLICATION } from '@/graphql/formQueries';
import { getClient } from '@/lib/apollo-client';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

// This page is a Server Component wrapper that supplies initial data to PublicationForm (client)

export default async function EditPublicationPage({ params }) {
  const { id } = params;
  const client = getClient();
  try {
    const { data } = await client.query({
      query: GET_PUBLICATION,
      variables: { documentId: id },
      fetchPolicy: 'no-cache'
    });
    if (!data?.publication) {
      redirect('/');
    }
    return (
      <div className="max-w-5xl mx-auto py-6">
        <h1 className="text-xl font-semibold mb-4">แก้ไขผลงานตีพิมพ์</h1>
        <PublicationForm initialData={data.publication} isEdit />
      </div>
    );
  } catch (e) {
    console.error('Failed to load publication', e);
    redirect('/');
  }
}
