#!/usr/bin/env node

'use strict'
const AWS = require('aws-sdk')
if (process.env.AWS_PROFILE) { // eslint-disable-line
  const credentials = new AWS.SharedIniFileCredentials({
    profile: process.env.AWS_PROFILE // eslint-disable-line
  })
  AWS.config.credentials = credentials
  AWS.config.logger = console
}
/* beautify preserve:start */
const cloudwatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' })
/* beautify preserve:end */
class Metrics {
  constructor(options) {
    // options.namespace
    //
    // options.dimensions
    //
    // {
    //  dimensionName1: dimensionValue1,
    //  dimensionName2: dimensionValue2,
    //  dimensionName3: dimensionValue3,
    // }
    //
    // options.metrics
    //
    // {
    //  metricName1: { unit: 'Count', dimensions: [dimensionName2] }
    //  metricName2: { unit: 'Count' }, // (all dimensions)
    //  metricName3: { unit: 'Count', dimensions: [dimensionName1, dimensionName3] },
    //  metricName4: { unit: 'Count', skipZero: true }, // don't add if value 0
    // }
    this.options = options
    this.params = {
      MetricData: [],
      Namespace: options.namespace
    }
  }
  addMetric(name, value, count = 1) {
    let dims = JSON.parse(JSON.stringify(this.options.dimensions))
    if (this.options.metrics[name].dimensions) {
      dims = {}
      for (const dimName of this.options.metrics[name].dimensions) {
        dims[dimName] = this.options.dimensions[dimName]
      }
    }
    for (const dimName of Object.keys(dims)) {
      const md = {
        MetricName: name,
        Dimensions: [{
          Name: dimName,
          Value: dims[dimName]
        }],
        Timestamp: new Date(),
        Unit: this.options.metrics[name].unit,
        Counts: Array.isArray(count) ? count : [count],
        Values: Array.isArray(value) ? value : [value]
      }
      if (this.options.metrics[name].skipZero) {
        for (let i = md.Values.length - 1; i >= 0; --i) {
          if (md.Values[i] === 0) {
            md.Counts.splice(i, 1)
            md.Values.splice(i, 1)
          }
        }
      }
      this.params.MetricData.push(md)
    }
  }
  putMetricData() {
    if (this.params.MetricData.length) {
      return cloudwatch.putMetricData(this.params).promise()
    }
    return Promise.resolve({ Info: 'No metrics to put. Doing nothing.' })
  }
  toString(indent) {
    return JSON.stringify(this, null, indent)
  }
}

if (require.main === module) {
  /* beautify preserve:start */
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
  /* beautify preserve:end */
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
}
