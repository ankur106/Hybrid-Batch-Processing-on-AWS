/* eslint-disable prettier/prettier */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { nanoid } from 'nanoid';


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id: string = nanoid();
    
        const obj = {
          'id': id,
          'input_text': event.queryStringParameters?.inputText || '',
          'input_file_path': "fovus-input/" + event.queryStringParameters?.inputFileName || ''
        };
    
        const command = new PutCommand({
            TableName : 'fovus-input',
            Item : obj
        });
    
        const res = await docClient.send(command);

        const body = JSON.stringify(res);
        const statusCode = 200;
        const headers = {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "X-Requested-With": "*"
       };
    
        return {
          statusCode,
          body,
          headers
        };


      } catch (err) {
        return {
          statusCode: 400,
          body: JSON.stringify(err)
        };
      }
};
