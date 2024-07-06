import axios from "axios";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ConfirmEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        await axios.post("/api/user/confirm-email", { code: token });
      } catch (error) {
        console.error(error);
      }
      navigate("/user/login");
    };

    confirmEmail();
  }, [token, navigate]);

  return (
    <div>
      <p>waiting for email confirmation...</p>
    </div>
  );
};

export default ConfirmEmail;
