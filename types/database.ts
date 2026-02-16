export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  supplier_id: string | null;
  unit: string;
  current_quantity: number;
  reorder_level: number;
  unit_price: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type StockMovement = {
  id: string;
  item_id: string;
  quantity_change: number;
  movement_type: "in" | "out" | "adjustment";
  notes: string | null;
  user_id: string;
  created_at: string;
};
