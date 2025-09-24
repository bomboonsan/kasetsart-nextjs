import Pageheader from '@/components/layout/Pageheader';
import BookForm from '@/components/form/BookForm';

export default function CreateBookPage() {
	return (
		<div>
			<Pageheader title="ผลงานหนังสือ/ตำรา" />
			<BookForm />
		</div>
	);
}

