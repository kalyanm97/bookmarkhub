import CreateBookmarkForm from '../../../../src/components/CreateBookmarkForm';
import RequireAuth from '../../../../src/components/RequireAuth';

export default function Page() {
  return (
    <RequireAuth>
      <main>
        <CreateBookmarkForm />
      </main>
    </RequireAuth>
  );
}
