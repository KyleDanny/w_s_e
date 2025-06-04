import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { IotProcessorStack } from "../lib/iot-processor-stack.js";

describe("IotProcessorStack", () => {
  let app: cdk.App;
  let stack: IotProcessorStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new IotProcessorStack(app, "TestStack");
    template = Template.fromStack(stack);
  });

  test("Creates DynamoDB table with correct configuration", () => {
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        {
          AttributeName: "deviceId",
          AttributeType: "S",
        },
        {
          AttributeName: "timestamp",
          AttributeType: "N",
        },
      ],
      KeySchema: [
        {
          AttributeName: "deviceId",
          KeyType: "HASH",
        },
        {
          AttributeName: "timestamp",
          KeyType: "RANGE",
        },
      ],
    });
  });

  test("Creates Weather Decoder Lambda function with correct configuration", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs18.x",
      Handler: "index.handler",
      MemorySize: 256,
      Timeout: 5,
    });
  });

  test("Creates API Lambda function with correct configuration", () => {
    // Should have 2 Lambda functions total
    template.resourceCountIs("AWS::Lambda::Function", 2);
  });

  test("Creates HTTP API Gateway", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
      ProtocolType: "HTTP",
    });
  });

  test("Creates API Gateway routes", () => {
    // Should have 2 routes: /weather and /upload
    template.resourceCountIs("AWS::ApiGatewayV2::Route", 2);

    template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      RouteKey: "GET /weather",
    });

    template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      RouteKey: "POST /upload",
    });
  });

  test("Creates Lambda integrations for API Gateway", () => {
    template.resourceCountIs("AWS::ApiGatewayV2::Integration", 2);

    template.hasResourceProperties("AWS::ApiGatewayV2::Integration", {
      IntegrationType: "AWS_PROXY",
    });
  });

  test("Configures CORS properly", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
      CorsConfiguration: {
        AllowHeaders: ["*"],
        AllowMethods: ["GET", "POST"],
        AllowOrigins: ["*"],
      },
    });
  });

  test("Stack synthesizes without errors", () => {
    expect(() => {
      app.synth();
    }).not.toThrow();
  });
});
