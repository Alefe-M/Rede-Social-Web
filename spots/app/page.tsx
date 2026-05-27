import Header from '@/components/Ui/Header';
import LoginForm from '@/components/Ui/LoginForm';
import Image from 'next/image'; // Importamos o componente de imagem do Next.js

export default function HomePage() {
  return (
    // 1. Mudança: Adicionamos o plano de fundo na div principal.
    // Usamos styles inline para o 'backgroundImage' apontar para a pasta public.
    // As classes 'bg-cover' (cobre tudo) e 'bg-center' (centraliza) são do Tailwind.
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/map-bg.jpg')" }} // <-- Caminho da sua imagem na pasta public
    >
      
      {/* 2. Opcional: Adicionamos uma "camada" (overlay) escura sobre o mapa
          para garantir que o formulário branco tenha bom contraste. */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 z-0"></div>

      {/* Header precisa de z-10 para ficar acima da camada escura */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main também precisa de z-10 */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
        
        {/* Adicionei 'bg-white/90' e 'backdrop-blur' no container do form 
            para ele ficar levemente transparente e bonito contra o mapa. */}
        <div className="w-full max-w-md flex flex-col gap-8 bg-white/95 dark:bg-gray-950/90 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
          
          <div className="text-center flex flex-col items-center gap-2">
            
            {/* 3. Mudança: Container do Título com Ícone */}
            {/* Usamos 'flex' e 'items-center' para alinhar o ícone e o texto na horizontal */}
            <div className="flex items-center gap-3">
              {/* Usando o componente Image do Next.js para carregar o SVG */}
              <Image 
                src="/map-icon.svg" // <-- Caminho do seu SVG na pasta public
                alt="Ícone de localização"
                width={36}          // Tamanho responsivo
                height={36}
                className="dark:invert" // Se for um SVG preto, inverta a cor no modo escuro
              />
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gray-900 dark:text-white">
                SpotS
              </h1>
            </div>

            <h2 className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Acesse ou crie sua conta
            </h2>
          </div>

          <LoginForm />
          
        </div>
      </main>
    </div>
  );
}