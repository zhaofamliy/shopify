import express from "express";
import shopify from "./domain/shopify/router";
import { logger } from "./logger";
const log = logger('app')

export const app = express()
app.use(express.json())
app.use('/shopify', shopify)

app.listen(3000, () => {
  log.info('server started.')
})