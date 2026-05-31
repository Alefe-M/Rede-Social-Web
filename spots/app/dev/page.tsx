import Header from "@/components/Ui/Header";

export default function DevPage() {
  return (
    <div>
      <Header />

      <main className="p-8">
        <h1 className="text-3xl font-bold">Página de desenvolvimento</h1>
        <p className="mt-4 text-gray-600">
          Use esta página para testar componentes sem precisar passar pelo login.
        </p>
      </main>
    </div>
  );
}