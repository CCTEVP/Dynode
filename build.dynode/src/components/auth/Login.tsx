import React, { useState } from "react";
import EmailStep from "./EmailStep";
import CodeVerificationStep from "./CodeVerificationStep";

type LoginStep = "email" | "verification";

const Login: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");

  const handleEmailVerified = (verifiedEmail: string) => {
    setEmail(verifiedEmail);
    setCurrentStep("verification");
  };

  return (
    <>
      {currentStep === "email" && (
        <EmailStep onEmailVerified={handleEmailVerified} />
      )}
      {currentStep === "verification" && <CodeVerificationStep email={email} />}
    </>
  );
};

export default Login;
