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

## AWS Credentials

You can set up your credentials for AWS as follows.

**Environment Variables**

```sh
# AWS_SDK_LOAD_CONFIG Tells AWS to read region and other info from ~/.aws/config
export AWS_SDK_LOAD_CONFIG=true
# If you are using a profile other than the default you can specify it here.
export AWS_PROFILE=my-profile
```

**~/.aws/config**

```
[default]
region = us-west-2

[my-profile]
region = us-east-1
```

**~/.aws/credentials**

```
[default]
aws_access_key_id=AKxxxxxxxxxxxxxW6
aws_secret_access_key=n3j******H9I

[my-profile]
aws_access_key_id=AS****VZ
aws_secret_access_key=jI*****8R8
aws_session_token=FQ***joBQ==
```

## Get Metrics from Cloudwatch

Here's how you can read the metrics back from Cloudwatch.

```sh
# put some metrics data
./index.js

# define our metric data queries
read -r -d "" rawQ <<EOF
[{
  "Id": "a$(echo $(uuidgen) | cut -d'-' -f 1)",
  "MetricStat": {
    "Metric": {
      "Namespace": "IXLEH/RawBatches",
      "MetricName": "LambdaInits",
      "Dimensions": [{
        "Name": "LambdaFunction",
        "Value": "raw-lambda"
      }]
    },
    "Period": 60,
    "Stat": "Sum",
    "Unit": "Count"
  },
  "ReturnData": true
},{
  "Id": "a$(echo $(uuidgen) | cut -d'-' -f 1)",
  "MetricStat": {
    "Metric": {
      "Namespace": "IXLEH/RawBatches",
      "MetricName": "EventsSent",
      "Dimensions": [{
        "Name": "LambdaFunction",
        "Value": "raw-lambda"
      }]
    },
    "Period": 60,
    "Stat": "Sum",
    "Unit": "Count"
  },
  "ReturnData": true
},{
  "Id": "a$(echo $(uuidgen) | cut -d'-' -f 1)",
  "MetricStat": {
    "Metric": {
      "Namespace": "IXLEH/RawBatches",
      "MetricName": "BatchesSent",
      "Dimensions": [{
        "Name": "LambdaFunctionCustomer",
        "Value": "raw-lambda-zexint07rust01"
      }]
    },
    "Period": 60,
    "Stat": "Sum",
    "Unit": "Count"
  },
  "ReturnData": true
}]
EOF

# get some metrics from cloudwatch
aws cloudwatch get-metric-data \
  --region us-west-2 \
  --metric-data-queries "${rawQ}" \
  --start-time 2019-06-13T13:17:00Z \
  --end-time $(date -u +"%Y-%m-%dT%H:%M:%SZ")

# --start-time $(date --date '-40 min' -u +"%Y-%m-%dT%H:%M:%SZ") \
```

**Results**

```json
{
  "MetricDataResults": [
    {
      "Id": "aB78F2DD8",
      "Label": "raw-lambda LambdaInits",
      "Timestamps": [
        "2019-06-13T13:17:00Z"
      ],
      "Values": [
        1.0
      ],
      "StatusCode": "Complete"
    },
    {
      "Id": "aDCD997A1",
      "Label": "raw-lambda EventsSent",
      "Timestamps": [
        "2019-06-13T13:17:00Z"
      ],
      "Values": [
        0.0
      ],
      "StatusCode": "Complete"
    },
    {
      "Id": "a416EED09",
      "Label": "raw-lambda-zexint07rust01 BatchesSent",
      "Timestamps": [
        "2019-06-13T13:17:00Z"
      ],
      "Values": [
        3831.0
      ],
      "StatusCode": "Complete"
    }
  ],
  "Messages": []
}
```

**AWS Lambda Built in Metrics**

Below is the query for getting the count of invocations for a given
Lambda function. You also get `Errors`, `Throttles`, etc.

See: https://docs.aws.amazon.com/lambda/latest/dg/monitoring-functions-metrics.html

```json
{
  "Id": "a$(echo $(uuidgen) | cut -d'-' -f 1)",
  "MetricStat": {
    "Metric": {
      "Namespace": "AWS/Lambda",
      "MetricName": "Invocations",
      "Dimensions": [{
        "Name": "FunctionName",
        "Value": "throttler-lambda"
      }]
    },
    "Period": 60,
    "Stat": "Sum",
    "Unit": "Count"
  },
  "ReturnData": true
}
```
