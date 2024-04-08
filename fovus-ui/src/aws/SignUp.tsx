import React, { useState } from "react";
import * as Yup from "yup";
import "./styles/SignUp.scss";
import {
  CognitoUserPool,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import { Button, FloatingLabel, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

const userPool: CognitoUserPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID!,
  ClientId: process.env.REACT_APP_APPCLIENT_ID!,
});

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email("Invalid email address")
          .required("Email is required"),
        password: Yup.string()
          .required("Password is required")
          .min(8, "Password must be at least 8 characters")
          .matches(/[0-9]/, "Password must contain at least one number")
          .matches(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
          )
          .matches(
            /[a-z]/,
            "Password must contain at least one lowercase letter"
          )
          .matches(
            /[\W_]/,
            "Password must contain at least one special character"
          ),
      });

      await schema.validate({ email, password }, { abortEarly: false });

      // If validation passes, you can proceed with signup logic
      console.log(
        "Signup submitted with email:",
        email,
        "and password:",
        password
      );
      const attributeList = [
        new CognitoUserAttribute({
          Name: "email",
          Value: email,
        }),
      ];
      userPool.signUp(
        email,
        password,
        attributeList,
        [],
        (err: Error | undefined, result: any) => {
          if (err) {
            console.log(err);
            return;
          }
          // console.log("call result: ", result);
          alert("Please verify email and signin");
          navigate("/");
        }
      );
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        error.inner.forEach((validationError) => {
          if (validationError.path === "email") {
            setEmailError(validationError.message);
          }
          if (validationError.path === "password") {
            setPasswordError(validationError.message);
          }
        });
      }
    }
  };

  return (
    <div className="signup-container content-center w-full max-w-md border-2 border-slate-300 border-solid rounded p-10 m-auto">
      <h2 className="mb-26 text-center">Signup</h2>
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
        <div className="form-group mb-6">
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
        <Button color="dark" className="w-full mb-6" type="submit">
          Signup
        </Button>
      </form>
    </div>
  );
};
