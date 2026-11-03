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
- SQLite local (`better-sqlite3`) em `data/manutencao.db`
- `signature_pad` + `jspdf`

## Como rodar

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

## Uso rápido

1. **Peças** (`/pecas`) — o catálogo já vem com peças de exemplo; edite ou adicione novas.
2. **Nova OS** (`/os/nova`) — preencha equipamento, cliente, problema, peças e assinatura.
3. **Busca** — na home, filtre por série ou nome do cliente.
4. **PDF** — abra uma OS salva e clique em **Exportar PDF**.

## Dados

O banco SQLite é criado automaticamente em `data/manutencao.db` na primeira execução.
