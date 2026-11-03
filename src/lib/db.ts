import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type {
  OrderPart,
  OrderPartInput,
  Part,
  ServiceOrder,
  ServiceOrderInput,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "manutencao.db");

declare global {
  // eslint-disable-next-line no-var
  var __manutencaoDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seed(db);
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS service_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_number TEXT NOT NULL,
      equipment_type TEXT NOT NULL,
      equipment_subtype TEXT NOT NULL,
      accessories TEXT NOT NULL DEFAULT '',
      service_type TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_cnpj TEXT NOT NULL DEFAULT '',
      quote_number TEXT NOT NULL DEFAULT '',
      responsible_phone TEXT NOT NULL DEFAULT '',
      problem_description TEXT NOT NULL DEFAULT '',
      solution_notes TEXT NOT NULL DEFAULT '',
      signature_data TEXT,
      pickup_name TEXT NOT NULL DEFAULT '',
      pickup_rg TEXT NOT NULL DEFAULT '',
      pickup_date TEXT NOT NULL DEFAULT '',
      delivery_name TEXT NOT NULL DEFAULT '',
      delivery_rg TEXT NOT NULL DEFAULT '',
      delivery_date TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'aberta',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
      part_id INTEGER REFERENCES parts(id) ON DELETE SET NULL,
      part_name TEXT NOT NULL,
      part_price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_orders_serial ON service_orders(serial_number);
    CREATE INDEX IF NOT EXISTS idx_orders_client ON service_orders(client_name);
  `);
}

function seed(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) as c FROM parts").get() as { c: number };
  if (count.c > 0) return;

  const now = new Date().toISOString();
  const insert = db.prepare(
    "INSERT INTO parts (name, price, created_at, updated_at) VALUES (?, ?, ?, ?)",
  );

  const samples: Array<[string, number]> = [
    ["Fonte 12V 3A", 89.9],
    ["Leitor biométrico", 320.0],
    ["Placa controladora", 450.0],
    ["Display LCD 2.4\"", 75.5],
    ["Cabo RJ45 3m", 25.0],
    ["Sensor facial", 580.0],
    ["Rolamento catraca", 42.0],
    ["Mola retorno", 18.5],
  ];

  const tx = db.transaction(() => {
    for (const [name, price] of samples) {
      insert.run(name, price, now, now);
    }
  });
  tx();
}

export function getDb(): Database.Database {
  if (!globalThis.__manutencaoDb) {
    globalThis.__manutencaoDb = createConnection();
  }
  return globalThis.__manutencaoDb;
}

export function listParts(): Part[] {
  return getDb()
    .prepare("SELECT * FROM parts ORDER BY name COLLATE NOCASE ASC")
    .all() as Part[];
}

export function getPart(id: number): Part | undefined {
  return getDb().prepare("SELECT * FROM parts WHERE id = ?").get(id) as
    | Part
    | undefined;
}

export function createPart(name: string, price: number): Part {
  const now = new Date().toISOString();
  const result = getDb()
    .prepare(
      "INSERT INTO parts (name, price, created_at, updated_at) VALUES (?, ?, ?, ?)",
    )
    .run(name.trim(), price, now, now);
  return getPart(Number(result.lastInsertRowid))!;
}

export function updatePart(id: number, name: string, price: number): Part | null {
  const existing = getPart(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  getDb()
    .prepare("UPDATE parts SET name = ?, price = ?, updated_at = ? WHERE id = ?")
    .run(name.trim(), price, now, id);
  return getPart(id)!;
}

export function deletePart(id: number): boolean {
  const result = getDb().prepare("DELETE FROM parts WHERE id = ?").run(id);
  return result.changes > 0;
}

function attachParts(order: ServiceOrder): ServiceOrder {
  const parts = getDb()
    .prepare("SELECT * FROM order_parts WHERE order_id = ? ORDER BY id ASC")
    .all(order.id) as OrderPart[];
  return { ...order, parts };
}

export function listOrders(query?: string): ServiceOrder[] {
  const db = getDb();
  let rows: ServiceOrder[];

  if (query && query.trim()) {
    const q = `%${query.trim()}%`;
    rows = db
      .prepare(
        `SELECT * FROM service_orders
         WHERE serial_number LIKE ? COLLATE NOCASE
            OR client_name LIKE ? COLLATE NOCASE
         ORDER BY id DESC`,
      )
      .all(q, q) as ServiceOrder[];
  } else {
    rows = db
      .prepare("SELECT * FROM service_orders ORDER BY id DESC")
      .all() as ServiceOrder[];
  }

  return rows.map(attachParts);
}

export function getOrder(id: number): ServiceOrder | undefined {
  const row = getDb()
    .prepare("SELECT * FROM service_orders WHERE id = ?")
    .get(id) as ServiceOrder | undefined;
  return row ? attachParts(row) : undefined;
}

function replaceOrderParts(orderId: number, parts: OrderPartInput[] = []) {
  const db = getDb();
  db.prepare("DELETE FROM order_parts WHERE order_id = ?").run(orderId);
  const insert = db.prepare(
    `INSERT INTO order_parts (order_id, part_id, part_name, part_price, quantity)
     VALUES (?, ?, ?, ?, ?)`,
  );
  for (const part of parts) {
    insert.run(
      orderId,
      part.part_id,
      part.part_name,
      part.part_price,
      Math.max(1, part.quantity || 1),
    );
  }
}

export function createOrder(input: ServiceOrderInput): ServiceOrder {
  const now = new Date().toISOString();
  const db = getDb();

  const tx = db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO service_orders (
          serial_number, equipment_type, equipment_subtype, accessories, service_type,
          client_name, client_cnpj, quote_number, responsible_phone,
          problem_description, solution_notes, signature_data,
          pickup_name, pickup_rg, pickup_date,
          delivery_name, delivery_rg, delivery_date,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.serial_number.trim(),
        input.equipment_type,
        input.equipment_subtype,
        input.accessories?.trim() || "",
        input.service_type,
        input.client_name.trim(),
        input.client_cnpj?.trim() || "",
        input.quote_number?.trim() || "",
        input.responsible_phone?.trim() || "",
        input.problem_description?.trim() || "",
        input.solution_notes?.trim() || "",
        input.signature_data || null,
        input.pickup_name?.trim() || "",
        input.pickup_rg?.trim() || "",
        input.pickup_date || "",
        input.delivery_name?.trim() || "",
        input.delivery_rg?.trim() || "",
        input.delivery_date || "",
        input.status || "aberta",
        now,
        now,
      );

    const orderId = Number(result.lastInsertRowid);
    replaceOrderParts(orderId, input.parts || []);
    return orderId;
  });

  const id = tx();
  return getOrder(id)!;
}

export function updateOrder(
  id: number,
  input: ServiceOrderInput,
): ServiceOrder | null {
  const existing = getOrder(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const db = getDb();

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE service_orders SET
        serial_number = ?, equipment_type = ?, equipment_subtype = ?, accessories = ?,
        service_type = ?, client_name = ?, client_cnpj = ?, quote_number = ?,
        responsible_phone = ?, problem_description = ?, solution_notes = ?,
        signature_data = ?, pickup_name = ?, pickup_rg = ?, pickup_date = ?,
        delivery_name = ?, delivery_rg = ?, delivery_date = ?, status = ?,
        updated_at = ?
       WHERE id = ?`,
    ).run(
      input.serial_number.trim(),
      input.equipment_type,
      input.equipment_subtype,
      input.accessories?.trim() || "",
      input.service_type,
      input.client_name.trim(),
      input.client_cnpj?.trim() || "",
      input.quote_number?.trim() || "",
      input.responsible_phone?.trim() || "",
      input.problem_description?.trim() || "",
      input.solution_notes?.trim() || "",
      input.signature_data ?? existing.signature_data,
      input.pickup_name?.trim() || "",
      input.pickup_rg?.trim() || "",
      input.pickup_date || "",
      input.delivery_name?.trim() || "",
      input.delivery_rg?.trim() || "",
      input.delivery_date || "",
      input.status || existing.status,
      now,
      id,
    );

    if (input.parts) {
      replaceOrderParts(id, input.parts);
    }
  });

  tx();
  return getOrder(id)!;
}

export function deleteOrder(id: number): boolean {
  const result = getDb().prepare("DELETE FROM service_orders WHERE id = ?").run(id);
  return result.changes > 0;
}
