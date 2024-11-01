import { DwnServerConfig, DwnStore, StoreType } from "@web5/dwn-server";
import type { Dialect } from "@tbd54566975/dwn-sql-store";
import {
  DataStore,
  DwnConfig,
  EventLog,
  EventStream,
  MessageStore,
  ResumableTaskStore,
  TenantGate,
} from "@tbd54566975/dwn-sdk-js";
import {
  DataStoreSql,
  EventLogSql,
  MessageStoreSql,
  PostgresDialect,
  ResumableTaskStoreSql,
} from "@tbd54566975/dwn-sql-store";
import pg from "pg";
import Cursor from "pg-cursor";

export function getDWNConfig(
  config: DwnServerConfig,
  options: {
    tenantGate?: TenantGate;
    eventStream?: EventStream;
  }
): DwnConfig {
  const { tenantGate, eventStream } = options;
  const dataStore: DataStore = getStore(config.dataStore, StoreType.DataStore);
  const eventLog: EventLog = getStore(config.eventLog, StoreType.EventLog);
  const messageStore: MessageStore = getStore(
    config.messageStore,
    StoreType.MessageStore
  );
  const resumableTaskStore: ResumableTaskStore = getStore(config.resumableTaskStore, StoreType.ResumableTaskStore);


  return { eventStream, eventLog, dataStore, messageStore, tenantGate, resumableTaskStore };
}

function getDBStore(
  db: Dialect,
  storeType: StoreType
): DwnStore {
  switch (storeType) {
    case StoreType.DataStore:
      return new DataStoreSql(db);
    case StoreType.MessageStore:
      return new MessageStoreSql(db);
    case StoreType.EventLog:
      return new EventLogSql(db);
    case StoreType.ResumableTaskStore:
      return new ResumableTaskStoreSql(db);
    default:
      throw new Error("Unexpected db store type");
  }
}

function getStore(
  storeString: string,
  storeType: StoreType.DataStore
): DataStore;
function getStore(
  storeString: string,
  storeType: StoreType.EventLog
): EventLog;
function getStore(
  storeString: string,
  storeType: StoreType.MessageStore
): MessageStore;
function getStore(
  storeString: string,
  storeType: StoreType.ResumableTaskStore
): ResumableTaskStore;
function getStore(storeString: string, storeType: StoreType): DwnStore {
  const storeURI = new URL(storeString);
  console.log(storeURI)
  return getDBStore(getDialectFromURI(storeURI), storeType);
}

function getDialectFromURI(url: URL): Dialect {
  const config = {
    host: url.hostname,
    port: url.port,
    database: url.pathname.slice(1), // Remove the leading '/'
    // ssl: {
    //   rejectUnauthorized: false // This is needed for `sslmode=require` without CA verification
    // }
  };
  
  // Optionally, handle different sslmode values differently
  // For example, if sslmode is not 'require', you might want to adjust the SSL config accordingly
  // if (url.searchParams.get('sslmode') === 'require') {
  //   config.ssl = {
  //     rejectUnauthorized: false
  //   };
  // } else {
  //   console.log("error in search params - ", url.searchParams)
  // }

  return new PostgresDialect({
    pool: async () =>
      new pg.Pool(config),
    cursor: Cursor,
  });
}
