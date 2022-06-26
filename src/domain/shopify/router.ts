import { Router } from "express";
import { ConvertMapping, ConvertMappingItem, parseFiles, readXlsx, SheetData, xlsx2json } from '../../utils';
import { Product } from './dto';
import { ShopifyService } from "./service";


const router = Router()
export default router;


const service = new ShopifyService();
router.get('/collections', async (req, res) => {
  res.send(await service.fetchCollections(req.query as any))
})

router.get('/products', async (req, res) => {
  res.send(await service.fetchProducts(req.query as any))
})

router.post('/products/import', async (req, res) => {
  const { files } = await parseFiles(req)
  const sheets: SheetData[] = []
  for (const file of files?.files ?? []) {
    sheets.push(...(await readXlsx(file.path)))
  }
  const products = sheets.map((i) => xlsx2json<Product>(i, { mapping })).flat()
  const result = await service.importProducts(products)
  res.send(result)
})

const boolConvert: ConvertMappingItem['formatter'] = (val: string) => {
  if (!val) return
  return /^true$/i.test(val) ? true : false;
}
const mapping: ConvertMapping = {
  "Handle": "handle",
  "Title": "title",
  "Body (HTML)": "body_html",
  "Vendor": "vendor",
  "Type": "product_type",
  "Tags": {
    field: "tags",
    formatter: (val: string) => {
      if (!val) return
      return val.split(",");
    },
  },
  "Published": {
    field: "published_at",
    formatter: (val: string) => {
      if (!val || !/^true$/i.test(val)) return
      return new Date().toLocaleString();
    }
  },
  "Option1 Name": "options.0.name",
  "Option1 Value": [
    "options.0.values.{inGroupRowIndex}",
    "variants.{inGroupRowIndex}.option1"
  ],
  "Option2 Name": "options.1.name",
  "Option2 Value": [
    "options.1.values.{inGroupRowIndex}",
    "variants.{inGroupRowIndex}.option2"
  ],
  "Option3 Name": "options.2.name",
  "Option3 Value": [
    "options.2.values.{inGroupRowIndex}",
    "variants.{inGroupRowIndex}.option3"
  ],
  "Variant SKU": "variants.{inGroupRowIndex}.sku",
  "Variant Grams": "variants.{inGroupRowIndex}.grams",
  // "Variant Inventory Tracker",
  "Variant Inventory Qty": "variants.{inGroupRowIndex}.inventory_quantity",
  "Variant Inventory Policy": "variants.{inGroupRowIndex}.inventory_policy",
  "Variant Fulfillment Service": "variants.{inGroupRowIndex}.fulfillment_service",
  "Variant Price": "variants.{inGroupRowIndex}.price",
  "Variant Compare At Price": "variants.{inGroupRowIndex}.compare_at_price",
  "Variant Requires Shipping": {
    field: "variants.{inGroupRowIndex}.requires_shipping",
    formatter: boolConvert,
  },
  "Variant Taxable": {
    field: "variants.{inGroupRowIndex}.taxable",
    formatter: boolConvert,
  },
  "Variant Barcode": "variants.{inGroupRowIndex}.barcode",
  "Image Src": "images.{inGroupRowIndex}.src",
  "Image Position": "images.{inGroupRowIndex}.position",
  // "Image Alt Text",
  // "Gift Card",
  "Variant Image": [
    "variants.{inGroupRowIndex}.image",
    {
      field: "variants.{inGroupRowIndex}.position",
      formatter: (val, row, { inGroupRowIndex }) => val ? inGroupRowIndex + 1 : null
    }
  ],
  "Variant Weight Unit": "variants.{inGroupRowIndex}.weight_unit",
  "Variant Tax Code": "variants.{inGroupRowIndex}.tax_code"
};