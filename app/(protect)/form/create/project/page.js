import Pageheader from '@/components/layout/Pageheader';
import ProjectForm from '@/components/form/ProjectForm';
export default function CreateProjectPage() {
    return (
        <div>
            <Pageheader title="หัวข้อโครงการวิจัย" />
            <ProjectForm />
        </div>
    );
}
