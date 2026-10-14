# STARK AI — site institucional

Site estático em HTML, CSS e JavaScript puros. Não precisa de build, framework nem instalação de pacotes.

## Estrutura

```
stark-ai/
├── index.html              Conteúdo e estrutura das seções
├── assets/
│   ├── css/styles.css      Identidade visual e responsividade (mobile first)
│   └── js/
│       ├── config.js       Dados da empresa: WhatsApp, e-mail, redes sociais
│       └── main.js         Menu, demonstrações, explorador, contato
└── README.md
```

## Como visualizar

Abra o `index.html` no navegador, ou rode um servidor local na pasta do projeto:

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

No Cursor ou VS Code, a extensão Live Server também funciona.

## Configuração obrigatória antes de publicar

Edite `assets/js/config.js`:

| Campo       | Formato                                   | Efeito no site                                   |
|-------------|-------------------------------------------|--------------------------------------------------|
| `whatsapp`  | só números, com país e DDD: `5531999998888` | Ativa o botão "Abrir conversa no WhatsApp"       |
| `email`     | `contato@seudominio.com.br`               | Mostra a opção de e-mail na seção de contato     |
| `social`    | URLs completas dos perfis                 | Mostra os links no rodapé                        |

Campos vazios ficam ocultos. Enquanto o WhatsApp estiver vazio, a seção de contato exibe um aviso de configuração pendente e o botão não abre nenhum link.

Também vale preencher em `index.html`, quando o domínio existir:
- `og:url` e `og:image` (imagem 1200x630) para o compartilhamento em redes e mensageiros.

## Como o contato funciona

1. O visitante informa o nome, escolhe o que quer simplificar e pode detalhar.
2. A prévia mostra a mensagem que será aberta.
3. O botão abre `wa.me` com o texto pronto. O visitante revisa e envia pelo próprio WhatsApp.
4. Botões de contexto (primeira tela, explorador, cabeçalho) preenchem o assunto automaticamente.

O site nunca informa "mensagem enviada", porque o envio acontece no WhatsApp.

## Trocar exemplos por projetos reais

Na seção "Na prática" (`index.html`), cada exemplo é um `<article data-example="...">`.
Substitua o conteúdo do article mantendo as classes. Troque a etiqueta "Exemplo de aplicação"
por "Projeto entregue" somente com autorização do cliente.

Os textos do explorador e da demonstração da primeira tela ficam em `assets/js/main.js`
(objetos `EXPLORER` e `FLOW_SCENARIOS`).

## Publicação

Por ser estático, funciona em GitHub Pages, Netlify, Vercel ou qualquer hospedagem comum.
No GitHub Pages: envie a pasta para um repositório, ative Pages em Settings → Pages, branch `main`, pasta raiz.

## Fontes

Anybody (títulos) e Instrument Sans (texto), carregadas do Google Fonts.
Para eliminar a dependência externa, baixe os arquivos .woff2 e declare com `@font-face` em `styles.css`.
