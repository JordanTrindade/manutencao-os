import fs from "fs";
import os from "os";
import path from "path";
import type {
  OrderPart,
  OrderPartInput,
  Part,
  ServiceOrder,
  ServiceOrderInput,
} from "./types";

// Na Vercel o diretório da função (/var/task) é somente leitura.
// /tmp aceita escrita, mas some quando a instância esfria.
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "manutencao-os")
  : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "manutencao.json");

let memoryOnly = false;

type Store = {
  nextPartId: number;
  nextOrderId: number;
  nextOrderPartId: number;
  parts: Part[];
  orders: ServiceOrder[];
};

declare global {
  // eslint-disable-next-line no-var
  var __manutencaoStore: Store | undefined;
}

const SAMPLE_PARTS: Array<[string, number]> = [
  ["Fonte 12V 3A", 89.9],
  ["Leitor biométrico", 320.0],
  ["Placa controladora", 450.0],
  ["Display LCD 2.4\"", 75.5],
  ["Cabo RJ45 3m", 25.0],
  ["Sensor facial", 580.0],
  ["Rolamento catraca", 42.0],
  ["Mola retorno", 18.5],
];

function emptyStore(): Store {
  return {
    nextPartId: 1,
    nextOrderId: 1,
    nextOrderPartId: 1,
    parts: [],
    orders: [],
  };
}

function seed(store: Store) {
  if (store.parts.length > 0) return;
  const now = new Date().toISOString();
  for (const [name, price] of SAMPLE_PARTS) {
    store.parts.push({
      id: store.nextPartId++,
      name,
      price,
      created_at: now,
      updated_at: now,
    });
  }
}

function loadStore(): Store {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_PATH)) {
      const store = emptyStore();
      seed(store);
      persist(store);
      return store;
    }

    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Store;
    const store: Store = {
      nextPartId: parsed.nextPartId ?? 1,
      nextOrderId: parsed.nextOrderId ?? 1,
      nextOrderPartId: parsed.nextOrderPartId ?? 1,
      parts: parsed.parts ?? [],
      orders: parsed.orders ?? [],
    };
    seed(store);
    return store;
  } catch (error) {
    console.error("Disco indisponível; dados ficam só na memória desta instância.", error);
    memoryOnly = true;
    const store = emptyStore();
    seed(store);
    return store;
  }
}

function persist(store: Store) {
  if (memoryOnly) return;
  try {
    const tmp = `${DB_PATH}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(store));
    fs.renameSync(tmp, DB_PATH);
  } catch (error) {
    console.error("Falha ao gravar o JSON; seguindo só em memória.", error);
    memoryOnly = true;
  }
}

function getStore(): Store {
  if (!globalThis.__manutencaoStore) {
    globalThis.__manutencaoStore = loadStore();
  }
  return globalThis.__manutencaoStore;
}

function save() {
  persist(getStore());
}

function cloneOrder(order: ServiceOrder): ServiceOrder {
  return {
    ...order,
    parts: (order.parts ?? []).map((part) => ({ ...part })),
  };
}

export function listParts(): Part[] {
  return getStore()
    .parts
    .map((part) => ({ ...part }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
}

export function getPart(id: number): Part | undefined {
  const part = getStore().parts.find((item) => item.id === id);
  return part ? { ...part } : undefined;
}

export function createPart(name: string, price: number): Part {
  const store = getStore();
  const now = new Date().toISOString();
  const part: Part = {
    id: store.nextPartId++,
    name: name.trim(),
    price,
    created_at: now,
    updated_at: now,
  };
  store.parts.push(part);
  save();
  return { ...part };
}

export function updatePart(id: number, name: string, price: number): Part | null {
  const store = getStore();
  const part = store.parts.find((item) => item.id === id);
  if (!part) return null;
  part.name = name.trim();
  part.price = price;
  part.updated_at = new Date().toISOString();
  save();
  return { ...part };
}

export function deletePart(id: number): boolean {
  const store = getStore();
  const index = store.parts.findIndex((item) => item.id === id);
  if (index < 0) return false;
  store.parts.splice(index, 1);
  for (const order of store.orders) {
    for (const part of order.parts ?? []) {
      if (part.part_id === id) part.part_id = null;
    }
  }
  save();
  return true;
}

export function listOrders(query?: string): ServiceOrder[] {
  const needle = query?.trim().toLocaleLowerCase("pt-BR") ?? "";
  return getStore()
    .orders
    .filter((order) => {
      if (!needle) return true;
      return (
        order.serial_number.toLocaleLowerCase("pt-BR").includes(needle) ||
        order.client_name.toLocaleLowerCase("pt-BR").includes(needle)
      );
    })
    .sort((a, b) => b.id - a.id)
    .map(cloneOrder);
}

export function getOrder(id: number): ServiceOrder | undefined {
  const order = getStore().orders.find((item) => item.id === id);
  return order ? cloneOrder(order) : undefined;
}

function replaceOrderParts(order: ServiceOrder, parts: OrderPartInput[] = []) {
  const store = getStore();
  order.parts = parts.map((part) => {
    const row: OrderPart = {
      id: store.nextOrderPartId++,
      order_id: order.id,
      part_id: part.part_id,
      part_name: part.part_name,
      part_price: part.part_price,
      quantity: Math.max(1, part.quantity || 1),
    };
    return row;
  });
}

function applyOrderFields(order: ServiceOrder, input: ServiceOrderInput, now: string) {
  order.serial_number = input.serial_number.trim();
  order.equipment_type = input.equipment_type;
  order.equipment_subtype = input.equipment_subtype;
  order.accessories = input.accessories?.trim() || "";
  order.service_type = input.service_type;
  order.client_name = input.client_name.trim();
  order.client_cnpj = input.client_cnpj?.trim() || "";
  order.quote_number = input.quote_number?.trim() || "";
  order.responsible_phone = input.responsible_phone?.trim() || "";
  order.problem_description = input.problem_description?.trim() || "";
  order.solution_notes = input.solution_notes?.trim() || "";
  order.signature_data = input.signature_data ?? order.signature_data;
  order.pickup_name = input.pickup_name?.trim() || "";
  order.pickup_rg = input.pickup_rg?.trim() || "";
  order.pickup_date = input.pickup_date || "";
  order.delivery_name = input.delivery_name?.trim() || "";
  order.delivery_rg = input.delivery_rg?.trim() || "";
  order.delivery_date = input.delivery_date || "";
  order.status = input.status || order.status;
  order.updated_at = now;
}

export function createOrder(input: ServiceOrderInput): ServiceOrder {
  const store = getStore();
  const now = new Date().toISOString();
  const order: ServiceOrder = {
    id: store.nextOrderId++,
    serial_number: "",
    equipment_type: input.equipment_type,
    equipment_subtype: input.equipment_subtype,
    accessories: "",
    service_type: input.service_type,
    client_name: "",
    client_cnpj: "",
    quote_number: "",
    responsible_phone: "",
    problem_description: "",
    solution_notes: "",
    signature_data: null,
    pickup_name: "",
    pickup_rg: "",
    pickup_date: "",
    delivery_name: "",
    delivery_rg: "",
    delivery_date: "",
    status: input.status || "aberta",
    created_at: now,
    updated_at: now,
    parts: [],
  };
  applyOrderFields(order, input, now);
  order.created_at = now;
  replaceOrderParts(order, input.parts || []);
  store.orders.push(order);
  save();
  return cloneOrder(order);
}

export function updateOrder(id: number, input: ServiceOrderInput): ServiceOrder | null {
  const store = getStore();
  const order = store.orders.find((item) => item.id === id);
  if (!order) return null;
  const now = new Date().toISOString();
  applyOrderFields(order, input, now);
  if (input.parts) replaceOrderParts(order, input.parts);
  save();
  return cloneOrder(order);
}

export function deleteOrder(id: number): boolean {
  const store = getStore();
  const index = store.orders.findIndex((item) => item.id === id);
  if (index < 0) return false;
  store.orders.splice(index, 1);
  save();
  return true;
}
