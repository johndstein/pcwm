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
Results** below.

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

m.putMetricData()
  .then((result) => {
    console.log('RESULT', result)
  })
  .catch((err) => {
    console.log('ERROR', err)
  })

m.addMetric('LambdaInits')
m.addMetric('BatchesSent', [3823, 0, 4], [1, 4, 2])
m.addMetric('EventsSent', 0)

m.putMetricData()
  .then((result) => {
    console.log('RESULT', result)
  })
  .catch((err) => {
    console.log('ERROR', err)
  })
```

**`putMetricData()` Results**

```
[AWS cloudwatch 200 0.699s 0 retries] putMetricData({ MetricData:
   [ { MetricName: 'LambdaInits',
       Dimensions: [ { Name: 'LambdaFunction', Value: 'raw-lambda' }, [length]: 1 ],
       Timestamp: 2019-06-13T12:58:56.011Z,
       Unit: 'Count',
       Counts: [ 1, [length]: 1 ],
       Values: [ 1, [length]: 1 ] },
     { MetricName: 'BatchesSent',
       Dimensions: [ { Name: 'LambdaFunction', Value: 'raw-lambda' }, [length]: 1 ],
       Timestamp: 2019-06-13T12:58:56.011Z,
       Unit: 'Count',
       Counts: [ 1, 2, [length]: 2 ],
       Values: [ 3823, 4, [length]: 2 ] },
     { MetricName: 'BatchesSent',
       Dimensions:
        [ { Name: 'LambdaFunctionCustomer',
            Value: 'raw-lambda-zexint07rust01' },
          [length]: 1 ],
       Timestamp: 2019-06-13T12:58:56.011Z,
       Unit: 'Count',
       Counts: [ 1, 2, [length]: 2 ],
       Values: [ 3823, 4, [length]: 2 ] },
     { MetricName: 'EventsSent',
       Dimensions: [ { Name: 'LambdaFunction', Value: 'raw-lambda' }, [length]: 1 ],
       Timestamp: 2019-06-13T12:58:56.011Z,
       Unit: 'Count',
       Counts: [ 1, [length]: 1 ],
       Values: [ 0, [length]: 1 ] },
     { MetricName: 'EventsSent',
       Dimensions:
        [ { Name: 'LambdaFunctionCustomer',
            Value: 'raw-lambda-zexint07rust01' },
          [length]: 1 ],
       Timestamp: 2019-06-13T12:58:56.011Z,
       Unit: 'Count',
       Counts: [ 1, [length]: 1 ],
       Values: [ 0, [length]: 1 ] },
     [length]: 5 ],
  Namespace: 'IXLEH/RawBatches' })
RESULT { ResponseMetadata: { RequestId: '04c7d5a0-8ddb-11e9-9b6f-390ace764264' } }
```
