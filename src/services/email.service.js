import nodemailer from "nodemailer";
import config from "../config/config.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: config.userEmail,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger <${config.userEmail}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


export const sendRegistrationEmail = async (userEmail, name) => {
  const subject = "Welcome to Backend Ledger 🎉";

  const text = `
Hello ${name},

Welcome to Backend Ledger!

We're excited to have you onboard. Your account has been successfully created, and you're now ready to explore everything Backend Ledger has to offer.

Thank you for joining our community. We look forward to being part of your journey.

If you have any questions or need assistance, feel free to reach out to our support team.

For security reasons, please never share your password with anyone.

Best Regards,
Backend Ledger Team

Building better backend experiences.
`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

  <body style="margin:0; padding:0; background-color:#f4f6f9; font-family:Arial, Helvetica, sans-serif;">

    <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden;">

      <!-- Header -->
      <div style="background:#111827; padding:30px; text-align:center;">
        <h1 style="color:#ffffff; margin:0; font-size:28px;">
          Backend Ledger
        </h1>
        <p style="color:#9ca3af; margin-top:10px; font-size:14px;">
          Building better backend experiences.
        </p>
      </div>

      <!-- Main Content -->
      <div style="padding:35px 30px;">

        <h2 style="color:#111827; margin-top:0;">
          Welcome aboard, ${name}!
        </h2>

        <p style="color:#4b5563; font-size:16px; line-height:1.7;">
          We're excited to have you join <strong>Backend Ledger</strong>.
        </p>

        <p style="color:#4b5563; font-size:15px; line-height:1.7;">
          Your account has been successfully created, and you're now ready
          to explore everything our platform has to offer.
        </p>

        <!-- Success Box -->
        <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:15px; margin:25px 0;">
          <p style="color:#065f46; margin:0; font-size:14px;">
            &#10003; Your registration was successful!
          </p>
        </div>

        <p style="color:#4b5563; font-size:15px; line-height:1.7;">
          Thank you for being part of our community. We look forward
          to helping you build, learn, and grow.
        </p>

        <p style="color:#4b5563; font-size:14px; line-height:1.7;">
          <strong>Security tip:</strong> Never share your password
          or account credentials with anyone.
        </p>

        <p style="color:#4b5563; font-size:15px; line-height:1.7;">
          If you have any questions or need assistance, our team
          is always happy to help.
        </p>

        <p style="color:#111827; font-size:15px; line-height:1.7; margin-top:30px;">
          Best Regards,<br />
          <strong>Backend Ledger Team</strong>
        </p>

      </div>

      <!-- Footer -->
      <div style="background:#f9fafb; padding:20px; text-align:center; border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af; font-size:12px; margin:5px 0;">
          © ${new Date().getFullYear()} Backend Ledger. All rights reserved.
        </p>
        <p style="color:#9ca3af; font-size:12px; margin:5px 0;">
          This email was sent because you registered for Backend Ledger.
        </p>
      </div>

    </div>

  </body>
  </html>
  `;

  await sendEmail(userEmail, subject, text, html);
};



export const sendDebitEmail = async (to, transaction) => {
  const { amount, _id, fromAccount, toAccount } = transaction;

  const subject = "Money Debited - Backend Ledger";

  const text = `
    Your account has been debited successfully.

    Transaction ID: ${_id}
    Amount: ₹${amount}
    From Account: ${fromAccount}
    To Account: ${toAccount}

    Thank you for using Backend Ledger.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Money Debited Successfully</h2>
      <p>₹${amount} has been debited from your account.</p>
      <p><strong>Transaction ID:</strong> ${_id}</p>
      <p><strong>From Account:</strong> ${fromAccount}</p>
      <p><strong>To Account:</strong> ${toAccount}</p>
      <p>Thank you for using Backend Ledger.</p>
    </div>
  `;

  await sendEmail(to, subject, text, html);
};


export const sendCreditEmail = async (to, transaction) => {
  const { amount, _id, fromAccount, toAccount } = transaction;

  const subject = "Money Received - Backend Ledger";

  const text = `
    Your account has been credited successfully.

    Transaction ID: ${_id}
    Amount: ₹${amount}
    From Account: ${fromAccount}
    To Account: ${toAccount}

    Thank you for using Backend Ledger.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Money Received Successfully</h2>
      <p>₹${amount} has been credited to your account.</p>
      <p><strong>Transaction ID:</strong> ${_id}</p>
      <p><strong>From Account:</strong> ${fromAccount}</p>
      <p><strong>To Account:</strong> ${toAccount}</p>
      <p>Thank you for using Backend Ledger.</p>
    </div>
  `;

  await sendEmail(to, subject, text, html);
};

