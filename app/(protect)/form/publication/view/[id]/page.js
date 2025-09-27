import { GET_PUBLICATION } from '@/graphql/formQueries';
import { getClient } from '@/lib/apollo-client';
import { redirect } from 'next/navigation';

export default async function ViewPublicationPage({ params }) {
  const { id } = params;
  const client = getClient();
  try {
    const { data } = await client.query({
      query: GET_PUBLICATION,
      variables: { documentId: id },
      fetchPolicy: 'no-cache'
    });
    const pub = data?.publication;
    
    
    return (
      <div className="max-w-5xl mx-auto py-6 space-y-4">
        <h1 className="text-xl font-semibold">รายละเอียดผลงานตีพิมพ์</h1>
        <div className="grid gap-2 text-sm">
          <Field label="ชื่อ (ไทย)">{pub.titleTH}</Field>
          <Field label="ชื่อ (อังกฤษ)">{pub.titleEN}</Field>
          <Field label="วารสาร" >{pub.journalName}</Field>
          <Field label="DOI" >{pub.doi}</Field>
          <Field label="ISBN" >{pub.isbn}</Field>
          <Field label="Volume/Issue" >{pub.volume} / {pub.issue}</Field>
          <Field label="ช่วงหน้า" >{pub.pageStart} - {pub.pageEnd}</Field>
          <Field label="ระดับ" >{pub.level}</Field>
          <Field label="แหล่งทุน" >{pub.fundName}</Field>
          <Field label="คำสำคัญ" >{pub.keywords}</Field>
          <Field label="บทคัดย่อ (ไทย)" >{pub.abstractTH}</Field>
          <Field label="บทคัดย่อ (อังกฤษ)" >{pub.abstractEN}</Field>
        </div>
        {pub.attachments?.length ? (
          <div>
            <h2 className="font-medium mb-2">ไฟล์แนบ</h2>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              {pub.attachments.map(f => (
                <li key={f.documentId}><a className="text-blue-600 hover:underline" href={f.url} target="_blank" rel="noopener noreferrer">{f.name}</a></li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  } catch (e) {
    console.error('Failed to load publication', e);
    redirect('/');
  }
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-gray-500 text-xs uppercase">{label}</div>
      <div>{children || '-'}</div>
    </div>
  );
}
