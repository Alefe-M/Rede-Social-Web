import Header from '@/components/Ui/Header';
import LoginForm from '@/components/Ui/LoginForm';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md flex flex-col gap-8">
          
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              SpotS
            </h1>
            <h2 className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              Acesse ou crie sua conta
            </h2>
          </div>

          <LoginForm />
          
        </div>
      </main>
    </div>
  );
}