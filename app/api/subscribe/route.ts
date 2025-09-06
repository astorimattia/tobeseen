import fs from 'fs/promises';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ message: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`New subscriber email: ${email}`);

    // Try to save the email to a file (optional - may fail in serverless)
    try {
      const filePath = './subscribers.txt';
      await fs.appendFile(filePath, email + '\n');
      console.log(`Email saved to file: ${email}`);
    } catch (fileError) {
      console.warn('Could not save email to file (serverless environment):', fileError);
      // Continue execution - file saving is optional
    }

    // Try to send notification email (optional - may fail if email not configured)
    try {
      const emailConfigured = process.env.EMAIL_HOST && 
                             process.env.EMAIL_USER && 
                             process.env.EMAIL_PASS && 
                             process.env.EMAIL_FROM && 
                             process.env.NOTIFICATION_EMAIL;

      console.log('Email configuration check:', {
        EMAIL_HOST: !!process.env.EMAIL_HOST,
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS,
        EMAIL_FROM: !!process.env.EMAIL_FROM,
        NOTIFICATION_EMAIL: !!process.env.NOTIFICATION_EMAIL,
        configured: emailConfigured
      });

      if (emailConfigured) {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: process.env.NOTIFICATION_EMAIL,
          subject: 'New Subscriber Alert!',
          text: `A new user has subscribed with the email: ${email}`,
          html: `
            <h2>New Subscriber Alert!</h2>
            <p>A new user has subscribed to your newsletter:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Notification email sent successfully for new subscriber: ${email}`);
      } else {
        console.log('❌ Email configuration not available, skipping email notification');
        console.log('Missing environment variables:', {
          EMAIL_HOST: !process.env.EMAIL_HOST,
          EMAIL_USER: !process.env.EMAIL_USER,
          EMAIL_PASS: !process.env.EMAIL_PASS,
          EMAIL_FROM: !process.env.EMAIL_FROM,
          NOTIFICATION_EMAIL: !process.env.NOTIFICATION_EMAIL,
        });
      }
    } catch (emailError) {
      console.error('❌ Failed to send notification email:', emailError);
      // Continue execution - email sending is optional
    }

    return new Response(JSON.stringify({ message: 'Subscription successful!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}