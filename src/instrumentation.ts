// /*instrumentation.ts*/
// import { NodeSDK } from '@opentelemetry/sdk-node'
// import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
// import { Resource } from '@opentelemetry/resources'
// import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

// import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'

// const promExporter = new PrometheusExporter({
// )

// promExporter.startServer()

// const sdk = new NodeSDK({
//   resource: new Resource({
//     [SemanticResourceAttributes.SERVICE_NAME]: 'yourServiceName',
//     [SemanticResourceAttributes.SERVICE_VERSION]: '1.0',
//   }),
//   traceExporter: promExporter,
//   metricReader: new PeriodicExportingMetricReader({
//     exporter: promExporter,
//   }),
// })

// sdk.start()

// // gracefully shut down the SDK on process exit
// process.on('SIGTERM', () => {
//   sdk
//     .shutdown()
//     .then(() => console.log('Tracing terminated'))
//     .catch((error) => console.log('Error terminating tracing', error))
//     .finally(() => process.exit(0))
// })

import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'

const options = { port: 9464 }
const exporter = new PrometheusExporter(options)

// Creates MeterProvider and installs the exporter as a MetricReader
const meterProvider = new MeterProvider()
meterProvider.addMetricReader(exporter)
const meter = meterProvider.getMeter('example-prometheus')

// Now, start recording data
const counter = meter.createCounter('metric_name', {
  description: 'Example of a counter',
})
counter.add(10, { pid: process.pid })
