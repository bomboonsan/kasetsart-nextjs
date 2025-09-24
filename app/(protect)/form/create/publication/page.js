import PublicationForm from '@/components/form/PublicationForm';
import Pageheader from '@/components/layout/Pageheader';

export default function CreatePublicationPage() {
	return (
        <div>
            <Pageheader title="ผลงานตีพิมพ์ทางวิชาการ" />
            <PublicationForm />
        </div>
	);
}
