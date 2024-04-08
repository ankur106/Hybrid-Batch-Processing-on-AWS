import { EC2Client, RunInstancesCommand } from "@aws-sdk/client-ec2";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBStreamEvent, Context } from "aws-lambda";

const client = new EC2Client({ region: "us-east-2" });
const client_s3 = new S3Client({});

export const handler = async (event: DynamoDBStreamEvent, context: Context) => {
  console.info("EVENT\n" + JSON.stringify(event, null, 2));

  if (
    !(
      event &&
      event.Records &&
      event.Records[0] &&
      event.Records[0].dynamodb &&
      event.Records[0].dynamodb.NewImage
    )
  )
    return;
  const inputText = event.Records[0].dynamodb.NewImage.input_text.S;

  const input_file_path = event.Records[0].dynamodb.NewImage.input_file_path.S;

  if (input_file_path == undefined || input_file_path == "undefined") return;

  const id = event.Records[0].dynamodb.NewImage.id.S;

  const file_name_arr = input_file_path.split("/");
  const file_name = "Output_" + file_name_arr[1];

  const file_name_without_txt = file_name_arr[1].split(".")[0];
  const sh_file_name = file_name_without_txt + ".sh";

  // setup table similar to fovus-exec-scripts to upload scripts and fovus-output to store final output file
  //setup table similar to fovus-output in dynamodb for entries after execution
  // change details in below tables

  const userdata = `#!/bin/bash
#Install AWS CLI
yum update -y 
yum install -y aws-cli
aws s3 cp s3://fovus-exec-scripts/${sh_file_name} /tmp/${sh_file_name}
chmod +x /tmp/${sh_file_name}
/tmp/${sh_file_name}
`;
  // UserData Script to install AWS CLI and fetch the script from S3 and execute it.
  const new_userdata = Buffer.from(userdata).toString("base64");

  // Script which will be uploaded to s3. It will fetch the file from s3 create new file, append and put data in s3 and entry in dynamodb table.
  // Script will also terminate instance at the end of the execution
  const script_to_upload = `#!/bin/bash
# Download file from S3
aws s3 cp s3://${input_file_path} /tmp/${file_name}


echo ":${inputText}" >> /tmp/${file_name}

# Upload the modified file back to S3
aws s3 cp /tmp/${file_name} s3://fovus-output/${file_name}


aws dynamodb put-item --table-name fovus-output --item '{ "id": {"S" : "${id}"}, "output_file_path": { "S": "fovus-output/${file_name}" } }'
    
    
instance_id=$(ec2-metadata -i | grep -oP 'i-\\w+')
aws ec2 terminate-instances --instance-ids $instance_id --region us-east-2
`;

  // Uploading Script to S3

  const command_s3 = new PutObjectCommand({
    Bucket: "fovus-exec-scripts",
    Key: sh_file_name,
    Body: Buffer.from(script_to_upload, "utf-8"),
    ContentType: "text/x-shellscript",
  });

  try {
    console.log(JSON.stringify(command_s3));
    const response = await client_s3.send(command_s3);
    console.log(response);
  } catch (err) {
    console.error(err);
  }

  // Create and Start Instance
  // Create your own launch template or write specification directly. It should have access to S3, Dynamodb and EC2 Instance termination access
  const command = new RunInstancesCommand({
    LaunchTemplate: {
      // LaunchTemplateSpecification
      LaunchTemplateId: "lt-0a0b9a788ef4ac485",
      Version: "1",
    },
    MinCount: 1,
    MaxCount: 1,
    UserData: new_userdata,
  });

  try {
    const response = await client.send(command);
    console.log("Response" + response);
  } catch (err) {
    console.error("Error" + err);
  }

  console.log(JSON.stringify(userdata, null, 2));

  console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2));

  console.warn("Event not processed.");

  // We can see console logs in cloudwatch logs with context.logStreamName
  return context.logStreamName;
};
