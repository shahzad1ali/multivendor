import React, { useEffect } from "react";
import Login from "../components/Login.jsx";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated} = useSelector((state) => state.user);
  console.log("checking authenticated",isAuthenticated)
  useEffect(() => {
    if (isAuthenticated === true) {
      navigate("/");
    }
  }, [isAuthenticated,navigate]);

  return (
    <div>
      <Login />
    </div>
  );
};

export default LoginPage;
