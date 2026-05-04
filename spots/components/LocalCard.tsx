// app/components/LocalCard.tsx

// 1. Aqui definimos quais "ingredientes" (props) o nosso card vai precisar receber
interface LocalCardProps {
  nome: string;
  endereco: string;
  nota: number;
  avaliacoes: number;
  estrelas: string;
}

// 2. Aqui criamos o componente em si, recebendo as props
export default function LocalCard({ nome, endereco, nota, avaliacoes, estrelas }: LocalCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Usamos as chaves { } para colocar as variáveis do JavaScript dentro do HTML */}
      <h3 className="text-xl font-bold text-gray-900">{nome}</h3>
      <p className="text-gray-500 mt-1">{endereco}</p>
      
      <div className="mt-4 flex items-center gap-2">
        <span className="text-yellow-500 text-lg">{estrelas}</span>
        <span className="text-gray-700 font-medium">{nota}</span>
        <span className="text-gray-400 text-sm">({avaliacoes} avaliações)</span>
      </div>
    </div>
  );
}