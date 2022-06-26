export class Image {
  created_at?: string;
  height?: number;
  id?: number;
  position?: number;
  product_id?: number;
  src?: string;
  updated_at?: string;
  variant_ids?: number[];
  width?: number;
}
export class Variant {
  barcode?: string;
  compare_at_price?: string;
  created_at?: string;
  fulfillment_service?: string;
  grams?: number;
  id?: number;
  image_id?: number;
  inventory_item_id?: number;
  inventory_management?: string;
  inventory_policy?: string;
  inventory_quantity?: number;
  inventory_quantity_adjustment?: number;
  old_inventory_quantity?: number;
  option1?: string;
  option2?: string;
  option3?: string;
  position?: number;
  presentment_prices?: Record<string, unknown>[];
  price?: string;
  product_id?: number;
  requires_shipping?: boolean;
  sku?: string;
  tax_code?: string;
  taxable?: boolean;
  title?: string;
  updated_at?: string;
  weight?: number;
  weight_unit?: string;
  image?: string;
}

export class Product {
  id?: number;
  title?: string;
  body_html?: string;
  created_at?: string;
  handle?: string;
  images?: Image[];
  options?: Record<string, unknown>[];
  product_type?: string;
  published_at?: string;
  published_scope?: string;
  status?: string;
  tags?: string | string[];
  template_suffix?: string;
  updated_at?: string;
  variants?: Variant[];
  vendor?: string;
}