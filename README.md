# pcwm

Put Cloudwatch metrics with Node.js

The idea here is to make it easy to send a single custom metric with
multiple dimensions.

Multiple dimensions for a single metric are pretty much useless with
custom metrics.

https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html

The whole reason to have multiple dimensions would be if you want to
slice and dice (which AWS allow you to do with some of their built in
metrics, but not with custom metrics).

Here we are just making it easy to send multiple copies of a single
metric each with a different dimension. You will have to do your own
aggregating, but at least you have the data split out.

## Quick Start

The first `m.putMetricData()` won't do anything because there's
nothing to do.

The second one will send metric data as show in **`putMetricData()`
Params** below.

```js
const options = {
  namespace: 'IXLEH/RawBatches',
  dimensions: {
    LambdaFunction: 'raw-lambda',
    LambdaFunctionCustomer: 'raw-lambda-zexint07rust01',
  },
  metrics: {
    LambdaInits: { unit: 'Count', dimensions: [ 'LambdaFunction' ] },
    BatchesSent: { unit: 'Count', skipZero: true },
    EventsSent: { unit: 'Count' },
  }
}
const m = new Metrics(options)
console.log(m.toString(3))
m.putMetricData()
  .then((result) => {
    console.log('RESULT', result)
  })
  .catch((err) => {
    console.log('ERROR', err)
  })

m.addMetric('BatchesSent', [3823, 0, 4], [1, 4, 2])
console.log(m.toString(3))
m.addMetric('EventsSent', 0)
console.log(m.toString(3))

m.putMetricData()
  .then((result) => {
    console.log('RESULT', result)
  })
  .catch((err) => {
    console.log('ERROR', err)
  })
```

**`putMetricData()` Params**

```json
{
  "MetricData": [
    {
      "MetricName": "BatchesSent",
      "Dimensions": [
        {
          "Name": "LambdaFunction",
          "Value": "raw-lambda"
        }
      ],
      "Timestamp": "2019-06-13T12:50:12.017Z",
      "Unit": "Count",
      "Counts": [
        1,
        2
      ],
      "Values": [
        3823,
        4
      ]
    },
    {
      "MetricName": "BatchesSent",
      "Dimensions": [
        {
          "Name": "LambdaFunctionCustomer",
          "Value": "raw-lambda-zexint07rust01"
        }
      ],
      "Timestamp": "2019-06-13T12:50:12.017Z",
      "Unit": "Count",
      "Counts": [
        1,
        2
      ],
      "Values": [
        3823,
        4
      ]
    },
    {
      "MetricName": "EventsSent",
      "Dimensions": [
        {
          "Name": "LambdaFunction",
          "Value": "raw-lambda"
        }
      ],
      "Timestamp": "2019-06-13T12:50:12.017Z",
      "Unit": "Count",
      "Counts": [
        1
      ],
      "Values": [
        0
      ]
    },
    {
      "MetricName": "EventsSent",
      "Dimensions": [
        {
          "Name": "LambdaFunctionCustomer",
          "Value": "raw-lambda-zexint07rust01"
        }
      ],
      "Timestamp": "2019-06-13T12:50:12.018Z",
      "Unit": "Count",
      "Counts": [
        1
      ],
      "Values": [
        0
      ]
    }
  ],
  "Namespace": "IXLEH/RawBatches"
}
```
