# Instruções de Configuração - Supabase

Para que o backend real funcione, siga estes passos simples:

1.  **Crie um Projeto**: Vá em [supabase.com](https://supabase.com/) e crie um novo projeto.
2.  **Execute o SQL**: No seu dashboard do Supabase, procure por **"SQL Editor"** no menu lateral esquerdo, clique em "New Query" e cole o conteúdo do arquivo `supabase_schema.sql` que salvei na raiz desta pasta. Clique em **Run**.
3.  **Copie as Chaves**: Vá em **Project Settings > API** e procure por:
    - `Project URL`
    - `anon public` key
4.  **Configure no Projeto**: No seu VS Code, crie ou edite o arquivo `.env.local` na raiz da pasta `finanza` e adicione:

```env
VITE_SUPABASE_URL=SUA_URL_AQUI
VITE_SUPABASE_ANON_KEY=SUA_KEY_AQUI
```

---
> [!TIP]
> Assim que você fizer isso, a aplicação começará a salvar os dados nas nuvens em vez de apenas no seu navegador!
