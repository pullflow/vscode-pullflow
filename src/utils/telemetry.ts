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

const extensionInfo = extensions.getExtension('Pullflow.pullflow')?.packageJSON

export class Trace {
  tracer: Tracer
  provider: BasicTracerProvider
  defaultAttributes: Attributes

  constructor(context: ExtensionContext) {
    this.provider = new BasicTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: extensionInfo.name,
        [SemanticResourceAttributes.SERVICE_VERSION]: extensionInfo.version,
      }),
    })

    const exporter = new OTLPTraceExporter({
      url: 'http://localhost:4318/v1/traces',
      compression: 'gzip' as any,
    })
    this.provider.addSpanProcessor(new BatchSpanProcessor(exporter))
    this.tracer = this.provider.getTracer(extensionInfo.name)
    const { user } = Store.get(context)
    this.defaultAttributes = user || {}
  }

  dispose(): void {
    void this.provider.shutdown()
  }

  start({
    name,
    attributes,
  }: {
    name: string
    attributes: TraceAttributes
  }): Span {
    const span = this.tracer.startSpan(name, {
      kind: SpanKind.INTERNAL,
      startTime: Date.now(),
    })
    span.setAttributes({
      ...attributes,
      ...this.defaultAttributes,
    })
    return span
  }

  end(span: Span): void {
    span.end(Date.now())
  }
}
