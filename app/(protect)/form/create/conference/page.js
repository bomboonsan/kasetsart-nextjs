import Pageheader from '@/components/layout/Pageheader';
import ConferenceForm from '@/components/form/ConferenceForm';
export default function CreateProjectPage() {
    return (
        <div>
            <Pageheader title="ผลงานนำเสนอในการประชุมวิชาการ" />
            <ConferenceForm />
        </div>
    );
}
