export type EquipmentType = "Relógio" | "Catraca";

export type EquipmentSubtypeRelogio = "Facial" | "Biométrico";
export type EquipmentSubtypeCatraca = "Fit" | "Revolution";
export type EquipmentSubtype = EquipmentSubtypeRelogio | EquipmentSubtypeCatraca;

export type ServiceType = "Manutenção" | "Garantia" | "Contrato/Aluguel";

export type OrderStatus = "aberta" | "concluida" | "entregue";

export interface Part {
  id: number;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface OrderPart {
  id: number;
  order_id: number;
  part_id: number | null;
  part_name: string;
  part_price: number;
  quantity: number;
}

export interface ServiceOrder {
  id: number;
  serial_number: string;
  equipment_type: EquipmentType;
  equipment_subtype: EquipmentSubtype;
  accessories: string;
  service_type: ServiceType;
  client_name: string;
  client_cnpj: string;
  quote_number: string;
  responsible_phone: string;
  problem_description: string;
  solution_notes: string;
  signature_data: string | null;
  pickup_name: string;
  pickup_rg: string;
  pickup_date: string;
  delivery_name: string;
  delivery_rg: string;
  delivery_date: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  parts?: OrderPart[];
}

export interface OrderPartInput {
  part_id: number | null;
  part_name: string;
  part_price: number;
  quantity: number;
}

export interface ServiceOrderInput {
  serial_number: string;
  equipment_type: EquipmentType;
  equipment_subtype: EquipmentSubtype;
  accessories?: string;
  service_type: ServiceType;
  client_name: string;
  client_cnpj?: string;
  quote_number?: string;
  responsible_phone?: string;
  problem_description?: string;
  solution_notes?: string;
  signature_data?: string | null;
  pickup_name?: string;
  pickup_rg?: string;
  pickup_date?: string;
  delivery_name?: string;
  delivery_rg?: string;
  delivery_date?: string;
  status?: OrderStatus;
  parts?: OrderPartInput[];
}

export const EQUIPMENT_SUBTYPES: Record<EquipmentType, EquipmentSubtype[]> = {
  Relógio: ["Facial", "Biométrico"],
  Catraca: ["Fit", "Revolution"],
};

export const SERVICE_TYPES: ServiceType[] = [
  "Manutenção",
  "Garantia",
  "Contrato/Aluguel",
];
