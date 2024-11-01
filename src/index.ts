import * as dotenv from "dotenv";
dotenv.config();

import { Dwn, DwnConfig } from "@tbd54566975/dwn-sdk-js";
// import { Dwn, DwnConfig } from "fork-theisens-dwn-sdk-js"
import bytes from "bytes";

import { DwnServer, DwnServerConfig } from "@web5/dwn-server";
import { getDWNConfig } from "./storage.js";

const dwnServerConfig: DwnServerConfig = {
  serverName:
    process.env.npm_package_name ||
    process.env.DWN_SERVER_PACKAGE_NAME ||
    "@web5/dwn-server",
  baseUrl: process.env.DWN_BASE_URL || "http://localhost",
  packageJsonPath:
    process.env.npm_package_json ||
    process.env.DWN_SERVER_PACKAGE_JSON ||
    "/dwn-server/package.json",
  maxRecordDataSize: bytes(process.env.MAX_RECORD_DATA_SIZE || "1gb"),
  port: parseInt(process.env.DS_PORT || "3000"),
  ttlCacheUrl: process.env.DWN_TTL_CACHE_URL || "sqlite://",
  webSocketSupport:
    { on: true, off: false }[process.env.DS_WEBSOCKET_SERVER] ?? true,
  eventStreamPluginPath: process.env.DWN_EVENT_STREAM_PLUGIN_PATH,
  messageStore:
    process.env.DWN_STORAGE_MESSAGES ||
    process.env.DWN_STORAGE ||
    "level://data",
  dataStore:
    process.env.DWN_STORAGE_DATA || process.env.DWN_STORAGE || "level://data",
  eventLog:
    process.env.DWN_STORAGE_EVENTS || process.env.DWN_STORAGE || "level://data",
  resumableTaskStore:
    process.env.DWN_STORAGE_RESUMABLE_TASKS ||
    process.env.DWN_STORAGE ||
    "level://data",
  registrationStoreUrl:
    process.env.DWN_REGISTRATION_STORE_URL || process.env.DWN_STORAGE,
  registrationProofOfWorkSeed: process.env.DWN_REGISTRATION_PROOF_OF_WORK_SEED,
  registrationProofOfWorkEnabled:
    process.env.DWN_REGISTRATION_PROOF_OF_WORK_ENABLED === "true",
  registrationProofOfWorkInitialMaxHash:
    process.env.DWN_REGISTRATION_PROOF_OF_WORK_INITIAL_MAX_HASH,
  termsOfServiceFilePath: process.env.DWN_TERMS_OF_SERVICE_FILE_PATH,
  logLevel: "TRACE"
};

// make our own Postgres stores here and pass them to the Dwn constructor
const dwnConfig: DwnConfig = getDWNConfig(dwnServerConfig, {});

const dwn: Dwn = (await Dwn.create(dwnConfig)) as any;

const server = new DwnServer({
  dwn: dwn as any
});

server.start();
