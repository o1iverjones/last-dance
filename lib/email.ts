import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Last Dance <onboarding@resend.dev>";
const APP_NAME = "Last Dance";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Reset your ${APP_NAME} password`,
    html: `
      <p>Hi,</p>
      <p>We received a request to reset your password for your ${APP_NAME} account.</p>
      <p>
        <a href="${resetUrl}" style="background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">
          Reset password
        </a>
      </p>
      <p>This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
