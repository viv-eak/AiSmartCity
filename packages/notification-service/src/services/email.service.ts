import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025", 10),
  secure: false,
});

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  await transporter.sendMail({
    from: '"Smart City" <noreply@smartcity.gov>',
    to,
    subject,
    html: body,
  });
  console.log(`Email sent to ${to}: ${subject}`);
}
