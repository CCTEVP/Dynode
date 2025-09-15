import React, { useState, useRef, useEffect } from "react";
import { Button, Typography, App } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/auth";
import "./Login.css";

const { Title, Text } = Typography;

interface CodeVerificationStepProps {
  email: string;
}

const CodeVerificationStep: React.FC<CodeVerificationStepProps> = ({
  email,
}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { setDomains } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { message } = App.useApp();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      message.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyCode(email, verificationCode);

      if (response.success && response.token) {
        message.success("Access granted!");
        login(response.token);
        // if API returned domains explicitly, persist them in context
        if (
          Array.isArray((response as any).domains) &&
          (response as any).domains.length
        ) {
          setDomains((response as any).domains);
        }
      } else {
        message.error(response.message);
        // Clear code inputs on error
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      message.error("An error occurred. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) {
      message.error("Please paste only numbers");
      return;
    }

    const newCode = [...code];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="yin-yang-icon">
            <div className="yin-yang">
              <div className="dot-light"></div>
              <div className="dot-dark"></div>
            </div>
          </div>
          <Title level={3} className="login-title">
            Welcome to Project DYNODE
          </Title>
          <Text className="login-subtitle">
            We sent a verification code to <strong>{email}</strong>
          </Text>
          <Text className="login-subtitle-2">Paste it below to continue.</Text>
        </div>

        <div className="login-form">
          <div className="code-inputs" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="code-input"
                disabled={loading}
                pattern="[0-9]"
              />
            ))}
          </div>

          <Button
            type="primary"
            size="large"
            className="login-button"
            onClick={handleVerify}
            loading={loading}
            disabled={code.some((digit) => !digit)}
            block
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeVerificationStep;
