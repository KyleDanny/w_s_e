import {
  Duration,
  Stack,
  StackProps,
  RemovalPolicy,
  CfnOutput,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as path from "path";
import * as apigateway from "@aws-cdk/aws-apigatewayv2-alpha";
import * as integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

export class IotProcessorStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the dynamo table
    const table = new dynamodb.Table(this, "WeatherTable", {
      partitionKey: { name: "deviceId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "timestamp", type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create the lambda weather decoder function
    const WeatherDecoderLambda = new lambda.Function(
      this,
      "WeatherDecoderLambda",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.handler", // matches dist/index.js export
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../lambda/decoder-handler-dist")
        ),
        memorySize: 256,
        timeout: Duration.seconds(5),
        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );

    table.grantWriteData(WeatherDecoderLambda);

    // Create the API lambda function (WeatherApiLambda)
    const apiLambda = new lambda.Function(this, "WeatherApiLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../lambda/api-handler-dist")
      ),
      memorySize: 256,
      timeout: Duration.seconds(5),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(apiLambda);

    // Create API Gateway
    const httpApi = new apigateway.HttpApi(this, "WeatherHttpApi", {
      corsPreflight: {
        allowHeaders: ["*"],
        allowMethods: [
          apigateway.CorsHttpMethod.GET,
          apigateway.CorsHttpMethod.POST,
        ],
        allowOrigins: ["*"],
      },
      // defaultIntegration: new integrations.HttpLambdaIntegration(
      //   "WeatherIntegration",
      //   WeatherDecoderLambda
      // ),
    });

    // Enable binary media types (only fully supported on REST API, may not work on HttpApi as expected)
    (httpApi as any).addBinaryMediaType?.("application/octet-stream");

    httpApi.addRoutes({
      path: "/weather", // frontend reads from here
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "WeatherApiIntegration",
        apiLambda
      ),
    });

    httpApi.addRoutes({
      path: "/upload", // simulator writes binary here
      methods: [apigateway.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        "WeatherDecoderIntegration",
        WeatherDecoderLambda
      ),
    });

    // Output the API endpoint
    new CfnOutput(this, "ApiEndpoint", {
      value: httpApi.url!,
    });
  }
}
