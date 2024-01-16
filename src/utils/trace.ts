/* eslint-disable no-unused-vars */
import { Span, Tracer, SpanKind, Attributes } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import {
  BasicTracerProvider,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { ExtensionContext, extensions } from 'vscode'
import { TraceAttributes } from './types'
import { Store } from './store'
import { AppConfig } from './appConfig'
import { log } from './logger'

const extensionInfo = extensions.getExtension('Pullflow.pullflow')?.packageJSON

type FakeTracer = {}
type FakeBasicTracerProvider = {}
type FakeAttribute = {}

// Null Object Design pattern
export function instantiatePullflowTracer(context: ExtensionContext) {
  const { isTelemetryEnabled } = Store.get(context)
  if (isTelemetryEnabled) {
    return new Trace(context)
  } else {
    return new FakeTrace(context)
  }
}
class FakeTrace {
  tracer: FakeTracer
  provider: FakeBasicTracerProvider
  defaultAttributes: FakeAttribute

  constructor(_context: ExtensionContext) {
    this.provider = {}
    this.tracer = {}
    this.defaultAttributes = {}
  }

  dispose(): void {}
  start({ name, attributes }: { name: string; attributes?: TraceAttributes }) {
    console.log({ name, attributes })
  }
  end({ attributes }: { attributes?: TraceAttributes }) {
    console.log({ attributes })
  }
}
class Trace {
  tracer: Tracer
  provider: BasicTracerProvider
  defaultAttributes: Attributes
  span: Span | undefined

  constructor(context: ExtensionContext) {
    this.provider = new BasicTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: extensionInfo.name,
        [SemanticResourceAttributes.SERVICE_VERSION]: extensionInfo.version,
      }),
    })

    const exporter = new OTLPTraceExporter({
      url: AppConfig.pullflow.telemetryUrl + '/v1/traces',
      compression: 'gzip' as any,
    })
    this.provider.addSpanProcessor(new BatchSpanProcessor(exporter))
    this.tracer = this.provider.getTracer(extensionInfo.name)
    const { user } = Store.get(context)
    this.defaultAttributes = user || {}
    this.span = undefined
  }

  dispose(): void {
    void this.provider.shutdown()
  }

  start({ name, attributes }: { name: string; attributes?: TraceAttributes }) {
    this.span = this.tracer.startSpan(name, {
      kind: SpanKind.INTERNAL,
      startTime: Date.now(),
    })
    if (attributes)
      this.span.setAttributes({
        ...attributes,
        ...this.defaultAttributes,
      })
  }

  end({ attributes }: { attributes?: TraceAttributes }): void {
    if (this.span === undefined) {
      log.warn('span is undefined', 'trace.ts')
      return
    }
    if (attributes)
      this.span.setAttributes({
        ...attributes,
        ...this.defaultAttributes,
      })
    this.span.end(Date.now())
  }
}
