# pcwm

Put Cloudwatch metrics with Node.js

The idea here is to make it easy to send a single custom metric with
multiple namespaces.

Multiple dimensions are pretty much useless with custom metrics.

https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html

The whole reason to have multiple dimensions would be if you want to
slice and dice (which AWS allow you to do with some of their built in
metrics, but not with custom metrics).

Here we are just making it easy to send multiple copies of a single
metric each with a different namespaces. You will have to do your own
aggregating, but at least you have the data split out.

