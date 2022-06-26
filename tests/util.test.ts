import assert from "assert"
import { resolve } from "path"
import { readXlsx, xlsx2json } from '../src/utils';

describe("Util", () => {
  describe("readXlsx()", () => {
    it("read xlsx data", async () => {
      const data = await readXlsx(resolve(__dirname, '../xlsx/jewelery.xlsx'))
      assert.equal(data.length, 1)
      assert.equal(data[0].data[20][1], 'Galaxy Earrings')
    })

    it("exception handling", () => {
      assert.doesNotThrow(async () => {
        const data = await readXlsx(resolve(__dirname, '../xlsx/jewelery1.xlsx'))
        assert.equal(data.length, 0)
      })
    })
  })


  const mapping = {
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
  }
  describe("xlsx2json()", () => {
    it("Get expected parameters", async () => {
      const data = await readXlsx(resolve(__dirname, '../xlsx/jewelery.xlsx'))
      const result = xlsx2json<any>(data[0], { mapping, groupCol: 0, headerRow: 0 })

      assert.equal(result.length, 20)
      assert.equal(result[0].handle, 'chain-bracelet')
      assert.equal(result[1].options[0].values[1], 'Silver')
    })

    it("Get invalid parameters", async () => {
      assert.equal(xlsx2json<any>(undefined as any).length, 0)
    })
  })
})


