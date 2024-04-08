# Fovus Project

*Please setup your own dynamodb tables, buckets, congnito user pool, cognito identity pool, API Gateway and configure it in the code*

## Demo Video
**!!!See the demo video in Videos folder**

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
    - fovus-lambda for api gateway trigger
    - dynamodbtrigger for dynamodb event (I have used a launch template to launch ec2 instance which has machine type and IAM role) 
5. EC2
    - Virtual Machine

6. S3
    - Object Storage
    - fovus-input for uploding file from react
    - fovus-output for uploding file after execution from ec2
    - fovus-exec-scripts for uploading script from dynamodbtrigger
    - fovus-project-ui for static website hosting
7. Dynamodb
    - NoSQL key-value based database
    - fovus-input gets entry from fovus-lambda
    - fovus-ouutput gets entry from ec2 instance
8. Cloudwatch
    - To See logs from lambda execution
9. Run npm install for each of fovus-ui, fovus-lambda, and dynamodb-trigger.

10. Change resources name as per mentioned comments in file.

11. for lambdas run npm run build for both the projects and import via zip on respective lambdas.

12. for react project define own environments, change bucket name, or api name as per your resources, build and deploy with aws s3 sync ./build s3://fovus-project-ui commad (change bucket path).

## How to Setup
*Use Resourse Names as convinent and available. I am using resource names which I have used*


1. Congnito User Pool and Cognito Identity Pool
    - Cognito User Pool can be setup as per the requirements (MFA, Account Recovery, Password Policy). I have only inclued email parameter in my user pool.
    - For Cognito Identity Pool give Amazon Cognito User Pool for user asses and I have only allowed Authenticated Access.
    - The role assined to our identity pool should have s3:PutObject permission on fovs-input bucket arn.
    - We will require user pool id and identit pool id in our react app.
    - Permissions defined in role assigned to fovus-identity-pool
        - ![Login Page](/images/permissions/fovus-identity-pool-role.jpg)
2. API Gateway
    - We need to specify method request (Authorization, queryparameters, body, response).
    - For integration Request choose the lamba and don't forget to enable lamba proxy integration.
3. fovus-lambda (integration with api gateway)
    - we can have resource based policy for API Gateway POST request here which should enable lambda Invocation (It will be setup automatically when we integrate lambda).
    -  this lamda role will have a defaullt AWSLambdaBasicExecutionRole which can create log streams and putLogevent.
    - We need to additionally define "dynamodb:PutItem" access for out dynamodb table ARNs
    - Permissions defined in role assigned to fovus lambda
        - ![Login Page](/images/permissions/fovus-lambda.jpg) 
4. dynamodb
    - fovus-input has dynamodb stream enabled for **New Object**.
5. dynamodbTrigger
    - It will require AWSLambdaBasicExecutionRole, AWSLambdaInvocation-DynamoDB, AWSLambdaDynamoDBExecutionRole.
    - Additionally we need to give "iam:PassRole","ec2:GetLaunchTemplateData", "s3:PutObject", "ec2:RunInstances" for respective ARNs.
    - iam: PassRole is needed to pass role to staring instance from lambda.
    - While configuring lambda I have kept batch size 1 and starting position latest 
    - Permissions defined in role assigned to dynamodbtrigger lambda
        - ![Login Page](/images/permissions/dynamodbtrigger_lmbda.jpg) 
6. s3 buckets
    - Here we need to have public access for fovus-project-ui, so we should not block public access. It should have static website hosting enabled. And should have bucket policy which allows "s3:PutObject" on the bucket.
7. EC2 instance role
    - Here the role is assigned in launch template, so all the instances will get role defined.
    - I have given AmazonSSMFullAccess for debugging purpose I have not assigned any security groups, "dynamodb:BatchGetItem",
                "dynamodb:PutItem",
                "dynamodb:GetItem", on respective dynamodb arn, "s3:PutObject",
                "s3:GetObject", for respective s3 bucket arns.
    - I have also assigned "ec2:TerminateInstances" for self termination after execution.
    - Permissions defined in role assigned to instance which will execute
        - ![Login Page](/images/permissions/fovus-user-1.jpg)
        - ![Login Page](/images/permissions/fovus-user-2.jpg) 

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