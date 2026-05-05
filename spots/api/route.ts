
import { error } from "console";
import { NextResponse } from "next/server";

interface Post {
    id: number;
    usuario: string;
    nome_local: string;
    cidade: string;
    estado: string;
    avaliacao: number;
    descricao: string;
    fotos: string;
    data: string
}

let posts: Post[] = [
    {
        id: 1,
        usuario: "Álefe",
        nome_local: "Parque Flamboyant",
        cidade: "Goiânia",
        estado: "GO",
        avaliacao: 4,
        descricao: "Lugar muito bom, porém pessoas mal intensionadas utilizando o local para coisas indesejadas.",
        fotos: "null",
        data: new Date().toISOString()
    }

];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estadoFiltro = searchParams.get('estado');

  
  if (estadoFiltro) {
    const filtrados = posts.filter(
      p => p.estado.toUpperCase() === estadoFiltro.toUpperCase()
    );
    return NextResponse.json(filtrados);
  }

  
  return NextResponse.json(posts);
}

export async function POST(request:Request) {
    try {
        const corpo = await request.json();

        // CORREÇÃO 2: Verificando 'nome_local' (que é o nome na sua interface)
        if (!corpo.nome_local || !corpo.estado) {
            return NextResponse.json(
                { erro: "Campos obrigatórios não preenchidos" },
                { status: 400 }
            );
        }

        const novoPost: Post = {
            id: Date.now(),
            usuario: corpo.usuario || "Anônimo",
            nome_local: corpo.nome_local,
            cidade: corpo.cidade,
            estado: corpo.estado.toUpperCase(),
            avaliacao: Number(corpo.avaliacao),
            descricao: corpo.descricao,
            fotos: corpo.fotos || "null",
            data: new Date().toISOString()
        };

        posts.unshift(novoPost);

        return NextResponse.json(novoPost, { status: 201 });

    } catch (error) { 
        return NextResponse.json(
            { erro: "Erro no processamento da postagem" },
            { status: 500 }
        );
    }
}
