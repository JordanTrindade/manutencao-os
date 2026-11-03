# Manutenção OS

Aplicação web de **ordens de serviço de manutenção** (relógios e catracas) para Jordan Trindade / Smart Empresarial.

## Funcionalidades

- Cadastro de OS: equipamento, cliente, problema, solução, assinatura e entrega/recolhimento
- Tipos de equipamento:
  - Relógio → Facial | Biométrico
  - Catraca → Fit | Revolution
- Tipos de serviço: Manutenção | Garantia | Contrato/Aluguel
- Catálogo admin de peças (CRUD com nome + preço)
- Busca por nº de série ou nome do cliente
- Assinatura na tela
- Exportação em PDF

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- SQLite local via `node:sqlite` (módulo embutido do Node — sem compilação nativa) em `data/manutencao.db`
- `signature_pad` + `jspdf`

## Requisitos

- **Node.js 22.5+** (recomendado: Node 22 LTS ou Node 24)
- Não é necessário Visual Studio Build Tools, Python nem `node-gyp`

## Como rodar (Windows / macOS / Linux)

No PowerShell, Prompt de Comando ou terminal:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Em produção:

```bash
npm run build
npm start
```

### Windows (sem ferramentas de build)

1. Instale o [Node.js](https://nodejs.org/) 22 ou 24 (instalador `.msi`).
2. Abra o PowerShell na pasta do projeto.
3. Rode `npm install` — deve concluir sem pedir Python/MSVC.
4. Rode `npm run dev` e acesse `http://localhost:3000`.

Se o Node for mais antigo que 22.5, atualize: o app usa o SQLite embutido do Node (`node:sqlite`) para evitar dependências nativas como `better-sqlite3`.

## Uso rápido

1. **Peças** (`/pecas`) — o catálogo já vem com peças de exemplo; edite ou adicione novas.
2. **Nova OS** (`/os/nova`) — preencha equipamento, cliente, problema, peças e assinatura.
3. **Busca** — na home, filtre por série ou nome do cliente.
4. **PDF** — abra uma OS salva e clique em **Exportar PDF**.

## Dados

O banco SQLite é criado automaticamente em `data/manutencao.db` na primeira execução (arquivos `.db` ficam fora do Git).
