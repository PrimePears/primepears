"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY); //TODO: Crate resend api key for primepears

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
    // const { data: emailData, error } = await resend.emails.send({
    const { data: error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: "liamlanders0@gmail.com",
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

    if (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in sendContactEmail:", error);
    throw new Error("Failed to send email");
  }
}
