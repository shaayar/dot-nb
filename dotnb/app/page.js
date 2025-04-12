import NotebookForm from './components/NotebookForm';
import NotebooksPage from './notebooks/page';

export default function Home() {
  const sec = "h-screen flex flex-col items-center justify-center";
  return (
    <div className="p-10 text-center ">
      <section className={sec}>
        <h1 className="text-8xl flex font-bold">Welcome to .NB</h1>
        <p className="mt-4 text-gray-600 text-4xl">Your next-gen note-taking space</p>
      </section>
      <section className={sec}>
        <h2 className="text-5xl font-semibold mb-2">Get started by creating your first notebook</h2>
        <NotebookForm />
      </section>
      <section className={sec}>
        <h2 className="text-5xl font-semibold mb-2">Or explore existing notebooks</h2>
        <p className="mt-4 text-gray-600 text-4xl">Click on a notebook to view its contents</p>
        <NotebooksPage />
      </section>
    </div>
  );
}
