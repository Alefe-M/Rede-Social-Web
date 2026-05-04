export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      
      {/* Cabeçalho da Página */}
      <header className="mb-10 text-center mt-10">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          SpotS
        </h1>
        <p className="text-lg text-gray-600">
          Descubra, avalie e compartilhe os melhores lugares da cidade.
        </p>
      </header>

      {/* Barra de Pesquisa */}
      <div className="mb-10 flex gap-2">
        <input 
          type="text" 
          placeholder="Buscar por restaurantes, cafés, praças..." 
          className="w-full border border-gray-300 p-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg transition-colors">
          Buscar
        </button>
      </div>

      {/* Lista de Locais (Feed) */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Em destaque hoje</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card de Local 1 */}
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-gray-900">Hamburgueria do Zé</h3>
            <p className="text-gray-500 mt-1">Rua Augusta, 1500 - Consolação</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-yellow-500 text-lg">★★★★☆</span>
              <span className="text-gray-700 font-medium">4.5</span>
              <span className="text-gray-400 text-sm">(124 avaliações)</span>
            </div>
          </div>

          {/* Card de Local 2 */}
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-gray-900">Café da Esquina</h3>
            <p className="text-gray-500 mt-1">Avenida Paulista, 200 - Bela Vista</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-yellow-500 text-lg">★★★★★</span>
              <span className="text-gray-700 font-medium">4.9</span>
              <span className="text-gray-400 text-sm">(89 avaliações)</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}