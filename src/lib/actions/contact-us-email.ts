"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactEmail(data: ContactFormData) {
  const { name, email, subject, message } = data;

  console.log("inside sendContactEmail");
  console.log(data);

  try {
    const {} = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: "info@primepears.com",
      subject: `Contact Form:  ${subject}`,
      text: `
      Name: ${name}
      Email: ${email}
      Subject: ${subject}
      
      Message:
      ${message}
            `,

      html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <h3>Message:</h3>
      <p>${message}</p>
            `,
    });

    return { success: true };
  } catch (error) {
    void error;
    throw new Error("Failed to send email");
  }
}
