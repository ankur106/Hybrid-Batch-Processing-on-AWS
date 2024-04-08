# Fovus Project

*Please setup your own dynamodb tables, buckets, congnito user pool, cognito identity pool, API Gateway and configure it in the code*

## Project Folders Info

### 1. fovus-ui

This Folder is for React TypeScript UI. It has components implementation with tailwind and flowbite.

With UI user can sign in to congnito user pool, login, access API Gateway to put records in dynamodb table **fovus-input**, and exchange id_token received from user pool to identity pool and upload file to s3 bucket **fovus-input**.
![Login Page](/images/ui/login.jpg)
![Login Page](/images/ui/signup.jpg)
![Login Page](/images/ui/upload.jpg)


### 2. fovus-lambda

This folder includes typescript project/environment for our first lambda which has trigger from API Gateway.

It accepts the requuest after API Gateway authenticates user with cognito identity pool and puts entry in dynamodb table name **fovus-input**.

### 3. dynamodb-trigger

This folder includes typescript project/environment for our second lambda which has trigger from dynamodb fovus-input table.

It accesses dynamodb event/stream, generates the script and upload to fovus-exec-scripts s3 bucket.

It starts and initiates instance with user data script which fetched script from S3 and executes it.

The Script in S3 fetched file from fovus-input, appends input_text send by user via UI, puts output file in fovus-output S3 bucket, puts entry in dynamodb table fovus-output, and terminates instance after execution is complete. 

## How to Setup


## AWS Used Resources Info
1. Cognito User Pool
    - For Adding Users in out application.
    - For providing authentication to React UI.
    - Provides autorization to API Gateway.
    - Integration with Identity Pool.
2. Cognito Identity Pool
    - Exchanges id_token with temporary AWS credentials (It gives permissions defined in role associated with Identity Pool).
3. API Gateway
    - Serverless api integration with lambda.
    - user authentication with cognito user pool.
4. Lambda
    - Serverless Node.js environment supporting javascript aws sdk v3. (need to setup typescript project in local, transpile/build, upload as a zip.)
5. EC2
    - Virtual Machine
6. S3
    - Object Storage
7. Dynamodb
    - NoSQL key-value based database
8. Cloudwatch
    - To See logs from lambda execution

## Demo Video
**See the demo video in Videos folder**

## Resources Used
 1. AWS SDK for JavaScript
    - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/
 2. tailwind css
    - https://tailwindcss.com/docs/installation
3. Flowbite components for react
    - https://flowbite-react.com/docs/getting-started/introduction
4. Cognito Identity Authentication
    - https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-browser-credentials-cognito.html
## Access Project
The Static UI is hosted on fovus-project-ui S3 bucket which is accessible from below link.

http://fovus-project-ui.s3-website.us-east-2.amazonaws.com