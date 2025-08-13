
"use server";

import { z } from "zod";
import { Resend } from 'resend';

// Initialize Resend only if the API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const contactSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export type FormState = {
  message: string;
  success: boolean;
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    phone?: string[];
    message?: string[];
  };
};

export async function submitContactForm(
  data: z.infer<typeof contactSchema>
): Promise<FormState> {
  // Check if Resend is configured
  if (!resend) {
    console.error('Resend is not configured. Please check your RESEND_API_KEY environment variable.');
    return {
      message: "The server is not configured to send emails. Please contact the site administrator.",
      success: false,
    };
  }
  
  const validatedFields = contactSchema.safeParse(data);

  // Return errors if validation fails
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the form errors.",
      success: false,
    };
  }

  const { firstName, lastName, email, phone, message } = validatedFields.data;
  const name = `${firstName} ${lastName}`;

  try {
    // Send email using Resend
    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // IMPORTANT: This must be a domain you've verified with Resend for production.
      to: 'bharathnaidu1402@gmail.com', //
      subject: `New Message from ${name} via Portfolio`,
      reply_to: email,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <hr />
        <h2>Message:</h2>
        <p>${message}</p>
      `,
    });
    
    return {
      message: "Thank you for your message! I'll get back to you soon.",
      success: true,
    };
  } catch (e) {
    console.error('Email sending error:', e);
    return {
      message: "An unexpected error occurred while sending the email. Please try again later.",
      success: false,
    };
  }
}
