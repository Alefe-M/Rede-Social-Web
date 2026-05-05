// Importamos o componente que acabamos de criar
import LocalCard from "../components/Feed/LocalCard";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      
      <header className="mb-10 text-center mt-10">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">SpotS</h1>
        <p className="text-lg text-gray-600">Descubra, avalie e compartilhe os melhores lugares da cidade.</p>
      </header>

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

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Em destaque hoje</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Olha como fica muito mais limpo! 
              Nós chamamos o componente e passamos as props (dados) para ele */}
          
          <LocalCard 
            nome="Hamburgueria do Zé"
            endereco="Rua Augusta, 1500 - Consolação"
            nota={4.5}
            avaliacoes={124}
            estrelas="★★★★☆"
          />

          <LocalCard 
            nome="Café da Esquina"
            endereco="Avenida Paulista, 200 - Bela Vista"
            nota={4.9}
            avaliacoes={89}
            estrelas="★★★★★"
          />
          
          {/* Quer adicionar um 3º local? É só colocar mais um componente! */}
          <LocalCard 
            nome="Parque Ibirapuera"
            endereco="Av. Pedro Álvares Cabral - Vila Mariana"
            nota={5.0}
            avaliacoes={3402}
            estrelas="★★★★★"
          />

        </div>
      </section>

    </div>
  );
}