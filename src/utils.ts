import { Form } from "multiparty"
import type { FormOptions } from "multiparty"
import { IncomingMessage } from "http"
import { Workbook } from "exceljs"
import { forEach, groupBy, has, isArray, isNil, isPlainObject, isString, set } from "lodash";

export interface ParseFilesFile {
  fieldName: string;
  originalFilename: string;
  path: string;
  headers: Record<string, string>;
  size: number;
}
export interface ParseFilesResult {
  files?: Record<string, ParseFilesFile[]>;
  fields?: Record<string, string[]>;
}
export const parseFiles = (req: IncomingMessage, options?: FormOptions): Promise<ParseFilesResult> => {
  const form = new Form(options)
  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) return reject(error)
      resolve({ fields, files })
    })
  })
}

export interface SheetData {
  id: number;
  name: string;
  data: string[][];
};
export const readXlsx = async (filename: string) => {
  const workbook = new Workbook()
  await workbook.xlsx.readFile(filename).catch(() => null)
  const data: SheetData[] = []
  workbook.eachSheet((worksheet, id) => {
    const sheetData: string[][] = []
    worksheet.eachRow((row, rowNumber) => {
      const rowData: string[] = []
      row.eachCell((cell, colNumber) => {
        rowData[colNumber - 1] = cell.text?.trim()
      })
      sheetData[rowNumber - 1] = rowData;
    })
    data.push({
      id,
      name: worksheet.name,
      data: sheetData,
    })
  })
  return data;
}

export interface ConvertMappingItem {
  field: string;
  formatter?(val: string, row: string[], options: { rowIndex: number; colIndex: number; inGroupRowIndex: number; }): any;
}
export interface ConvertMapping {
  [k: string]: string | ConvertMappingItem | (string | ConvertMappingItem)[];
}
export interface Xlsx2JsonOptions {
  mapping: ConvertMapping;
  headerRow?: number;
  groupCol?: number;

}
export const xlsx2json = <T>(xlsx: SheetData, options?: Xlsx2JsonOptions): T[] => {
  const { mapping = {}, headerRow = 0, groupCol = 0 } = options ?? {};
  const th = xlsx?.data?.[headerRow] ?? []
  const rows = xlsx?.data?.slice(1) ?? []
  const result: T[] = []
  const grouped = groupBy(rows, groupCol)
  let rowIndex = 0;
  forEach(grouped, (rows) => {
    const item: any = {}
    for (let i = 0; i < rows.length; ++i) {
      const row = rows[i]
      for (let j = 0; j < row.length; ++j) {
        const t = th[j]
        if (!has(mapping, t)) continue;
        const converies = parseM(mapping[t])
        const variables: Record<string, number> = {
          '{rowIndex}': rowIndex,
          '{colIndex}': j,
          '{inGroupRowIndex}': i,
        }
        for (const { field, formatter } of converies) {
          const k = field.replace(/\{[^}]+\}/g, (s) => `${variables[s]}`)
          const v = formatter ? formatter(row[j], row, { rowIndex, colIndex: j, inGroupRowIndex: i }) : row[j];
          if (!isNil(v)) set(item, k, v);
        }
      }
      ++rowIndex;
    }
    result.push(item)
  })
  return result;
}

const parseM = (m: string | ConvertMappingItem | (string | ConvertMappingItem)[]): ConvertMappingItem[] => {
  if (isString(m)) return [{ field: m }]
  if (isPlainObject(m)) return [m as ConvertMappingItem]
  if (isArray(m)) return m.map(parseM).flat()
  return [];
}