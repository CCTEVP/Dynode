import React, { useState } from "react";
import { Input, Button, Typography, App } from "antd";
import authService from "../../services/auth";
import "./Login.css";

const { Title, Text } = Typography;

interface EmailStepProps {
  onEmailVerified: (email: string) => void;
}

const EmailStep: React.FC<EmailStepProps> = ({ onEmailVerified }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleContinue = async () => {
    if (!email || !email.includes("@")) {
      message.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.checkEmail(email);

      if (response.success) {
        message.success(response.message);
        onEmailVerified(email);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleContinue();
    }
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
            Login or Request Access with your email.
          </Text>
        </div>

        <div className="login-form">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            size="large"
            className="login-input"
            disabled={loading}
          />

          <Button
            type="primary"
            size="large"
            className="login-button"
            onClick={handleContinue}
            loading={loading}
            disabled={!email.trim()}
            block
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailStep;
