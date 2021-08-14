import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "./deps.ts";

const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID") || "dummy-id";
const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "dummy-key";
if (accessKeyId === "dummy-id" || secretAccessKey === "dummy-key") {
  console.warn("missing credentials. starts with dummy values.");
}

const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: { accessKeyId, secretAccessKey },
});

const tableName = "Denote";

export interface DenoteSchema {
  name: string;
  hashedToken: string;
  config: string;
}

export async function putItem(data: DenoteSchema) {
  try {
    const response = await client.send(
      new PutItemCommand({
        TableName: tableName,
        Item: {
          // Here 'S' implies that the value is of type string
          name: { S: data.name },
          hashedToken: { S: data.hashedToken },
          config: { S: data.config },
        },
      }),
    );

    console.log(response);
    const { $metadata: { httpStatusCode } } = response;

    return httpStatusCode === 200;
  } catch (error) {
    console.log(error);
  }
  return false;
}

export async function getItem(name: string) {
  try {
    const response = await client.send(
      new GetItemCommand({
        TableName: tableName,
        Key: {
          name: { S: name },
        },
      }),
    );

    console.log(response);
    const { Item } = response;

    if (Item) {
      return {
        name: Item.name.S,
        hashedToken: Item.hashedToken.S,
        config: Item.config.S,
      };
    }
  } catch (error) {
    console.log(error);
  }
  return null;
}

export async function deleteItem(name: string) {
  try {
    const response = await client.send(
      new DeleteItemCommand({
        TableName: tableName,
        Key: {
          name: { S: name },
        },
      }),
    );

    console.log(response);
    const { $metadata: { httpStatusCode } } = response;

    return httpStatusCode === 200;
  } catch (error) {
    console.log(error);
  }
  return false;
}
