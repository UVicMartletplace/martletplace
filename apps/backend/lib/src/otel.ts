import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  trace,
} from "@opentelemetry/api";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { Resource } from "@opentelemetry/resources";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import {
  NodeTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import pgPromise from "pg-promise";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

const OTEL_COLLECTOR_ENDPOINT = process.env.OTEL_COLLECTOR_ENDPOINT;
if (!OTEL_COLLECTOR_ENDPOINT) {
  console.error("OTEL_COLLECTOR_ENDPOINT environment variable is not set");
  process.exit(1);
}
let SERVICENAME: string;

export const setupTracing = (serviceName: string) => {
  SERVICENAME = serviceName;
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
    }),
  });

  const exporter = new OTLPTraceExporter({
    url: OTEL_COLLECTOR_ENDPOINT,
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation({
        ignoreLayers: [
          "middleware - query",
          "middleware - expressInit",
          "middleware - logger",
          "middleware - cookieParser",
        ],
      }),
    ],
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  provider.register();

  return trace.getTracer(serviceName);
};

/*
 * The OTEL library @opentelemetry/instrumentation-pg logs all sql queries in full
 * (including the parameterized values). This leaks information and is bad. So instead
 * I had to write this crime against humanity.
 */
export function connectDB(connection_string: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function genericDbQuery(oldFn: any) {
    const serviceName = SERVICENAME;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async function (...args: any[]) {
      if (args.length > 0) {
        const t = trace.getTracer(serviceName);
        const s = t.startSpan("pg.query");
        s.setAttribute("db.statement", args[0].toString());
        const out = await oldFn(...args);
        s.end();
        return Promise.resolve(out);
      } else {
        return oldFn(...args);
      }
    };
  }

  const db = pgPromise()(connection_string);

  const oldNone = db.none;
  db.none = genericDbQuery(oldNone);

  const oldOneOrNone = db.oneOrNone;
  db.oneOrNone = genericDbQuery(oldOneOrNone);

  const oldOne = db.one;
  db.one = genericDbQuery(oldOne);

  const oldAny = db.any;
  db.any = genericDbQuery(oldAny);

  const oldMany = db.many;
  db.many = genericDbQuery(oldMany);

  const oldManyOrNone = db.manyOrNone;
  db.manyOrNone = genericDbQuery(oldManyOrNone);

  const oldResult = db.result;
  db.result = genericDbQuery(oldResult);

  return db;
}
