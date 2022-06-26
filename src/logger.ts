import debug from "debug";
export const logger = (m: string) => {
  return {
    info: debug(`${m}:info`),
    debug: debug(`${m}:debug`),
    error: debug(`${m}:error`),
    warn: debug(`${m}:warn`),
  }
}