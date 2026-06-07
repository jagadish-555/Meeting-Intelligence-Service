import { success } from "../utils/response.js";

const getEvaluation = (req, res) => {
  return success(res, {
    candidateName: "Jagadish Ishwar Patil",
    email: "jagadish.patil@adypu.edu.in",
    repositoryUrl: "https://github.com/jagadish-555/Meeting-Intelligence-Service",
    deployedUrl: "https://meeting-intelligence-service-j87i.onrender.com",
    externalIntegration: "Resend Email API",
    features: [
      "Authentication",
      "AI Analysis",
      "Reminder Scheduler",
      "Resend Email Integration"
    ]
  });
};

export { getEvaluation };
