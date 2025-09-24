import fs from 'fs/promises';
import { Resend } from 'resend';

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
      
      // Check if email already exists
      let existingEmails: string[] = [];
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        existingEmails = fileContent.split('\n').filter(line => line.trim() !== '');
      } catch (readError) {
        // File doesn't exist yet, that's fine
        console.log('Subscribers file does not exist yet, creating new one');
      }
      
      // Check for duplicate email
      if (existingEmails.includes(email)) {
        console.log(`Email already exists: ${email}`);
        return new Response(JSON.stringify({ message: 'Email already subscribed!' }), {
          status: 409, // Conflict status code
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Add new email
      await fs.appendFile(filePath, email + '\n');
      console.log(`Email saved to file: ${email}`);
    } catch (fileError) {
      console.warn('Could not save email to file (serverless environment):', fileError);
      // Continue execution - file saving is optional
    }

    // Try to send notification email using Resend
    try {
      const resendConfigured = process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL;

      console.log('Resend configuration check:', {
        RESEND_API_KEY: !!process.env.RESEND_API_KEY,
        NOTIFICATION_EMAIL: !!process.env.NOTIFICATION_EMAIL,
        configured: resendConfigured
      });

      if (resendConfigured) {
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Parse notification emails (support comma-separated list)
        const notificationEmails = process.env.NOTIFICATION_EMAIL
          ? process.env.NOTIFICATION_EMAIL.split(',').map(email => email.trim())
          : [];

        console.log('📧 Sending notification emails to:', notificationEmails);
        console.log('📧 Number of recipients:', notificationEmails.length);

        const { data, error } = await resend.emails.send({
          from: 'Sacratos <noreply@resend.dev>', // Using noreply instead of onboarding
          to: notificationEmails,
          subject: '🎬 New Subscriber Alert - Sacratos',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
                New Subscriber Alert!
              </h2>
              <p style="color: #666; font-size: 16px;">
                Someone has subscribed to your newsletter about hidden rituals and extreme traditions.
              </p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #333;">Email:</p>
                <p style="margin: 5px 0 0 0; color: #666; font-family: monospace;">${email}</p>
                <p style="margin: 15px 0 0 0; font-weight: bold; color: #333;">Time:</p>
                <p style="margin: 5px 0 0 0; color: #666;">${new Date().toLocaleString()}</p>
              </div>
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                This notification was sent from your Sacratos website subscription form.
              </p>
            </div>
          `,
        });

        if (error) {
          console.error('❌ Resend error:', error);
          console.error('❌ Error details:', JSON.stringify(error, null, 2));
        } else {
          console.log(`✅ Notification email sent successfully via Resend for: ${email}`);
          console.log('✅ Email data:', JSON.stringify(data, null, 2));
        }
      } else {
        console.log('❌ Resend configuration not available, skipping email notification');
        console.log('Missing environment variables:', {
          RESEND_API_KEY: !process.env.RESEND_API_KEY,
          NOTIFICATION_EMAIL: !process.env.NOTIFICATION_EMAIL,
        });
      }
    } catch (emailError) {
      console.error('❌ Failed to send notification email via Resend:', emailError);
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