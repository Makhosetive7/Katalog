import {
  testEmailConnection,
  sendTestEmail,
} from "../service/emailService/emailService.js";
import dotenv from "dotenv";

dotenv.config();

const testEmail = async () => {
  console.log("Testing email configuration...");

  // Test connection
  const connectionSuccess = await testEmailConnection();
  if (!connectionSuccess) {
    console.log("Email connection test failed");
    return;
  }

  console.log("Email connection successful");

  // Test sending (optional - uncomment to test sending)
  /*
  const testUser = {
    email: 'test@example.com',
    username: 'testuser'
  };
  
  const sendSuccess = await sendTestEmail(testUser);
  if (sendSuccess) {
    console.log('Test email sent successfully');
  } else {
    console.log('Test email failed to send');
  }
  */

  // node scripts/test-email.js
};

testEmail().catch(console.error);
