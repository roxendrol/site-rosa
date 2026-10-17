# Royal Beauty – como colocar no ar na Vercel

1. Crie uma conta grátis em github.com e um repositório novo (privado). Envie todos os arquivos desta pasta para ele (botão "Add file > Upload files").
2. Em vercel.com, clique em "Add New > Project", escolha o repositório e clique em Deploy (sem mudar nada).
3. No projeto da Vercel, aba **Storage** > "Create Database" > escolha **Upstash Redis** (plano grátis) > conecte ao projeto. Isso cria sozinho as variáveis de acesso ao banco.
4. Aba **Settings > Environment Variables**: crie `ADMIN_SETUP_KEY` com um código longo que só você sabe (ex.: 20+ letras e números).
5. Aba **Deployments** > "Redeploy" no último deploy.
6. Abra `seusite.vercel.app/#admin` (ou o link "Área do administrador" no rodapé). No primeiro acesso, cadastre seu e-mail, uma senha com 10+ caracteres e o código do passo 4. Pronto: depois é só entrar de qualquer aparelho.

Segurança já incluída: HTTPS automático, senha com hash (scrypt), sessão por cookie protegido, limite de tentativas de login, cabeçalhos de segurança e só o administrador consegue alterar produtos e enviar fotos.
Para trocar a senha depois: apague a chave `admin` no painel do Upstash e refaça o primeiro acesso.
