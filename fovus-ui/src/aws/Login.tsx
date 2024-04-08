// Login.tsx
import React, { useState } from "react";
import "./styles/Login.scss";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import { Button, FloatingLabel, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import {
  FOVUS_ACCESSTOKEN,
  FOVUS_AUTHENTICATED,
  FOVUS_IDTOKEN,
} from "./session.const";
const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID!,
  ClientId: process.env.REACT_APP_APPCLIENT_ID!,
});

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim() == "") {
      setEmailError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Invalid email format");
      return;
    }
    setEmailError("");

    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }
    setPasswordError("");

    const cognitoUser: CognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    const authenticationDetails : AuthenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    // User Authentication with cognito user pool
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result: CognitoUserSession) => {
        // console.log(result);

        const accessToken: string = result.getAccessToken().getJwtToken();
        const idToken: string = result.getIdToken().getJwtToken();

        // const refreshToken: string = result.getRefreshToken().getToken();

        sessionStorage.setItem(FOVUS_ACCESSTOKEN, accessToken);
        sessionStorage.setItem(FOVUS_IDTOKEN, idToken);
        sessionStorage.setItem(FOVUS_AUTHENTICATED, "true");

        navigate("/upload");
      },
      onFailure: (err) => {
        console.log("login failed", err);
      },
      newPasswordRequired: function (userAttributes, requiredAttributes) {
        //TO DO: In Future
        console.log(userAttributes, requiredAttributes);
      },
    });
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  return (
    <div className="content-center w-full max-w-md border-2 border-slate-300 border-solid rounded p-10 m-auto">
      <h2 className="mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6 mt-6">
          <FloatingLabel
            variant="outlined"
            label="Email"
            color={emailError != "" ? "error" : "success"}
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
          />
          {emailError != "" && (
            <Alert color="failure" icon={HiInformationCircle}>
              {emailError}
            </Alert>
          )}
        </div>
        <div className="mb-6">
          <FloatingLabel
            variant="outlined"
            label="Password"
            color={passwordError != "" ? "error" : "success"}
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
          />
          {passwordError != "" && (
            <Alert color="failure" icon={HiInformationCircle}>
              {passwordError}
            </Alert>
          )}
        </div>
        <Button color="blue" className="w-full mb-6" type="submit">
          Login
        </Button>
      </form>
      <Button color="dark" className="w-full" onClick={handleSignupClick}>
        Signup
      </Button>
    </div>
  );
};
