import React, { useState } from "react";
import "./styles/Upload.scss";
import axios from "axios";
import {
  FOVUS_ACCESSTOKEN,
  FOVUS_AUTHENTICATED,
  FOVUS_IDTOKEN,
} from "./session.const";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import { Button, FloatingLabel, Alert, FileInput, Label } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { RiLogoutCircleFill } from "react-icons/ri";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID!,
  ClientId: process.env.REACT_APP_APPCLIENT_ID!,
});

export const Upload: React.FC = () => {
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [textError, setTextError] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");

  const [fileContentstate, setFileContentstate] = useState("");
  const navigate = useNavigate();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
    if (!e.target.value.trim()) {
      setTextError("Text input cannot be empty");
    } else {
      setTextError("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFileError("Please select a file");
    } else {
      setFileError("");
      setFileInput(file);
      const fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = (e) => {
        if (!e.target?.result) return;
        const content = fileReader.result?.toString()!;
        setFileContentstate(content);
      };
    }
  };

  const handleSubmit = () => {
    if (!textInput.trim()) {
      setTextError("Text input cannot be empty");
    }

    if (!fileInput) {
      setFileError("Please select a file");
    }

    if (!textInput.trim() || !fileInput) {
      return;
    }
    const ApiCall = async () => {
      try {
        //uploadFileToS3
        const REGION = "us-east-2";

        let COGNITO_ID: string = process.env.REACT_APP_COGNITO_ID!;
        let loginData = {
          [COGNITO_ID]: sessionStorage.getItem(FOVUS_IDTOKEN)!,
        };

        const s3Client = new S3Client({
          region: REGION,
          credentials: fromCognitoIdentityPool({
            clientConfig: { region: REGION },
            identityPoolId: process.env.REACT_APP_IDENTITYPOOL_ID!,
            logins: loginData,
          }),
        });
        const command_s3 = new PutObjectCommand({
          Bucket: "fovus-input",
          Key: fileInput.name,
          Body: fileContentstate,
        });

        const response_s3 = await s3Client.send(command_s3);
        console.log("response_s3" + response_s3);

        // Send the POST request
        const authToken = sessionStorage.getItem(FOVUS_IDTOKEN);
        const response_api = await axios.post(
          `https://cpvyyndojk.execute-api.us-east-2.amazonaws.com/v1/fovus-lambda?inputText=${textInput}&inputFileName=${fileInput.name}`,
          {},

          {
            headers: {
              Authorization: authToken,
            },
          }
        );
        alert("File Upload to S3 and and Object send to DynamoDB");
        // console.log("response_api:", response_api.data);
      } catch (error) {
        alert(error);
        console.error("Error:", error);
      }
    };
    ApiCall();
  };

  const handleLogout = () => {
    const cognitoUser = userPool.getCurrentUser();
    console.log(cognitoUser);
    if (cognitoUser != null) {
      sessionStorage.removeItem(FOVUS_IDTOKEN);
      sessionStorage.removeItem(FOVUS_ACCESSTOKEN);
      sessionStorage.removeItem(FOVUS_AUTHENTICATED);

      cognitoUser.signOut();
    }
    navigate("/");
  };

  return (
    <div className="content-center w-full max-w-md border-2 border-slate-300 border-solid rounded p-10 m-auto">
      <Button className="absolute top-4 right-4" color="grey" pill>
        <RiLogoutCircleFill onClick={handleLogout} className="mr-2 h-5 w-5 " />
        Logout
      </Button>
      <h2 className="mb-6 text-center">Upload Component</h2>
      <div className="mb-6 mt-6">
        <FloatingLabel
          variant="outlined"
          label="Text Input:"
          color={textError != "" ? "error" : "success"}
          type="text"
          id="textInput"
          value={textInput}
          onChange={handleTextChange}
        />
        {textError != "" && (
          <Alert color="failure" icon={HiInformationCircle}>
            {textError}
          </Alert>
        )}
        {/* <label htmlFor="textInput">Text Input:</label>
        <input
          type="text"
          id="textInput"
          value={textInput}
          onChange={handleTextChange}
          className={textError ? "error" : ""}
        /> */}
        {/* {textError && <div className="error-message">{textError}</div>} */}
      </div>
      <div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="fileInput" value="Upload file" />
          </div>
          <FileInput id="fileInput"
          onChange={handleFileChange}
          accept=".txt"/>
        </div>
        {/* <label htmlFor="fileInput">File Input:</label>
        <input
          type="file"
          id="fileInput"
          onChange={handleFileChange}
          accept=".txt"
          className={fileError ? "error" : ""}
        /> */}
        {fileError != "" && (
            <Alert color="failure" icon={HiInformationCircle}>
              {fileError}
            </Alert>
          )}
        {/* {fileError && <div className="error-message">{fileError}</div>} */}
      </div>
      <div>
        {/* <button onClick={handleSubmit}>Submit</button> */}
        <Button  className="w-full mt-6" onClick={handleSubmit}>
        Submit
      </Button>
      </div>
    </div>
  );
};
