import type {
  AttributeValue,
  Span,
  TimeInput,
  Tracer,
} from '@opentelemetry/api'
import { SpanKind } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import {
  BasicTracerProvider,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { ExtensionContext } from 'vscode'

export class Analytics {
  tracer: Tracer
  provider: BasicTracerProvider

  constructor(context: ExtensionContext) {
    this.provider = new BasicTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]:
          context.extension.packageJSON.name,
        [SemanticResourceAttributes.SERVICE_VERSION]:
          context.extension.packageJSON.version,
      }),
    })

    const exporter = new OTLPTraceExporter({
      url: 'http://localhost:4318/v1/traces',
      compression: 'gzip' as any,
    })
    this.provider.addSpanProcessor(new BatchSpanProcessor(exporter))
    this.tracer = this.provider.getTracer(context.extension.packageJSON.name)
  }

  dispose(): void {
    void this.provider.shutdown()
  }

  startEvent({
    name,
    data,
    startTime,
  }: {
    name: string
    data?: Record<string, AttributeValue>
    startTime?: TimeInput
  }): Span {
    const span = this.tracer.startSpan(name, {
      kind: SpanKind.INTERNAL,
      startTime: startTime ?? Date.now(),
    })
    if (data) {
      span.setAttributes(data)
    }
    return span
  }

  sendEvent({
    name,
    data,
    startTime,
    endTime,
  }: {
    name: string
    data?: Record<string, AttributeValue>
    startTime?: TimeInput
    endTime?: TimeInput
  }): void {
    const span = this.tracer.startSpan(name, {
      kind: SpanKind.INTERNAL,
      startTime: startTime ?? Date.now(),
    })
    if (data) {
      span.setAttributes(data)
    }
    span.end(endTime)
  }
}
