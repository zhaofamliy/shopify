import Shopify, { ApiVersion, DataType, GetRequestParams, PostRequestParams, QueryParams, RestRequestReturn } from '@shopify/shopify-api';
import { isEmpty, keyBy, map } from 'lodash';
import { logger } from "../../logger";
import { Product } from './dto';
require("dotenv").config()

const log = logger("shopify:service")

const { API_KEY, API_SECRET_KEY, SCOPES, SHOP, ACCESS_TOKEN, HOST, HOST_SCHEME } = process.env
Shopify.Context.initialize({
  API_KEY: API_KEY!,
  API_SECRET_KEY: API_SECRET_KEY!,
  SCOPES: [SCOPES!],
  HOST_NAME: HOST!,
  HOST_SCHEME: HOST_SCHEME,
  IS_EMBEDDED_APP: false,
  API_VERSION: ApiVersion.April22,
});


export class ShopifyService {
  private client = new Shopify.Clients.Rest(SHOP!, ACCESS_TOKEN!);
  public async importProducts(products: Product[]): Promise<number[]> {
    const result = await Promise.all(products.map((product) => {
      return this.createProduct(product)
    }))
    return result;
  }

  public async createProduct(product: Product): Promise<number> {
    const { body } = await this.fetch({
      method: "post",
      path: '/products',
      type: DataType.JSON,
      data: { product },
    })
    await this.relationVariantsImage((body as any).product, product);
    return (body as any).product.id;
  }

  public async fetchProducts(query: Record<string, QueryParams>): Promise<Product[]> {
    const { body } = await this.fetch({ path: 'products', query });
    const products = (body as any)?.products;
    if (!products) {
      log.warn("产品查询失败!")
      return [];
    }
    return products as Product[];
  }

  public async fetchCollections(query: Record<string, QueryParams>) {
    const { body } = await this.fetch({ path: 'custom_collections', query });
    const collections = (body as any)?.custom_collections;
    if (!collections) {
      log.warn("产品集合查询失败!")
      return [];
    }
    return collections;
  }

  private relationVariantsImage(savedProduct: Product, product: Product) {
    const variants = product.variants?.filter(i => i.image);
    if (isEmpty(variants)) return;
    const vp = keyBy(savedProduct.variants, 'position')
    const ip = keyBy(savedProduct.images, 'position')
    const relations = map(variants, (i => {
      const position = product.images?.find(j => j.src == i.image)?.position;
      if (!position) return null
      return this.client.put({
        type: DataType.JSON,
        path: `/variants/${vp[i.position!].id}`,
        data: {
          variant: {
            id: vp[i.position!].id,
            image_id: ip[position].id
          }
        }
      })
    }));
    return Promise.all(relations);
  }

  private async fetch(params: (GetRequestParams | PostRequestParams) & { method?: "get" | "post" | "put" | "delete" }): Promise<Partial<RestRequestReturn>> {
    try {
      log.debug("调用第三方接口：", params)
      const { method = "get", ...options } = params
      const result = await this.client[method](options as any);
      log.debug("调用第三方接口结果：", result)
      return result;
    } catch (error) {
      log.error(error);
      return {
        body: null,
      }
    }
  }
}