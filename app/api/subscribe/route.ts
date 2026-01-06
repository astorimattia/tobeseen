import { createClient } from 'redis';
import { Resend } from 'resend';

const SUBSCRIBERS_KEY = 'subscribers';

// Create Redis client
function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }
  return createClient({ url: redisUrl });
}

export async function POST(req: Request) {
  const redis = getRedisClient();
  let redisConnected = false;

  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ message: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`New subscriber email: ${email}`);

    // Connect to Redis if not already connected
    if (!redis.isOpen) {
      await redis.connect();
      redisConnected = true;
    }

    // Save the email to Redis
    try {
      // Check if email already exists using Redis ZSCORE (for Sorted Sets)
      const score = await redis.zScore(SUBSCRIBERS_KEY, email);

      if (score !== null) {
        console.log(`Email already exists: ${email}`);
        return new Response(JSON.stringify({ message: 'Email already subscribed!' }), {
          status: 409, // Conflict status code
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Add new email to Redis Sorted Set with current timestamp as score
      await redis.zAdd(SUBSCRIBERS_KEY, { score: Date.now(), value: email });
      console.log(`Email saved to Redis: ${email}`);

      // Link Identity (Email) to VisitorId
      // Link Identity (Email) to VisitorId
      // Link Identity (Email) to VisitorId
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || '';
      const countryRaw = req.headers.get('x-vercel-ip-country') || 'Unknown';
      const cityRaw = req.headers.get('x-vercel-ip-city') || 'Unknown';

      // Decode location
      const country = decodeURIComponent(countryRaw);
      const city = decodeURIComponent(cityRaw);

      const visitorId = btoa(`${ip}-${userAgent}`).slice(0, 32);

      // Store Subscriber Metadata (New)
      console.log(`Saving metadata for ${email}: ${country}, ${city}`);
      await redis.hSet(`subscriber:${email}`, {
        ip,
        country,
        city,
        userAgent,
        joinedAt: new Date().toISOString()
      });

      // Store the link
      await redis.set(`analytics:identity:${visitorId}`, email);

      // Update Recent Identified Visitors List
      await redis.lPush('analytics:recent_identified_visitors', visitorId);
      await redis.lTrim('analytics:recent_identified_visitors', 0, 199);

      // Update visitor meta with email immediately if exists
      const metaKey = `analytics:visitor:${visitorId}`;
      const existingMeta = await redis.hGetAll(metaKey);
      if (existingMeta && Object.keys(existingMeta).length > 0) {
        await redis.hSet(metaKey, 'email', email);
      } else {
        // Create meta if doesn't exist (edge case)
        await redis.hSet(metaKey, {
          ip,
          userAgent,
          email,
          country,
          city,
          lastSeen: new Date().toISOString()
        });
      }

    } catch (redisError) {
      console.error('Could not save email to Redis:', redisError);
      // Return error if Redis fails - this is critical functionality
      return new Response(JSON.stringify({ message: 'Failed to save subscription. Please try again later.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Try to send notification email using Resend
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const resendConfigured = process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL;

      // Enhanced logging for production debugging - use console.error for visibility in Vercel
      const envCheck = {
        RESEND_API_KEY: !!process.env.RESEND_API_KEY,
        RESEND_API_KEY_LENGTH: process.env.RESEND_API_KEY?.length || 0,
        RESEND_API_KEY_PREFIX: process.env.RESEND_API_KEY?.substring(0, 10) || 'NOT_SET',
        NOTIFICATION_EMAIL: !!process.env.NOTIFICATION_EMAIL,
        NOTIFICATION_EMAIL_VALUE: process.env.NOTIFICATION_EMAIL ?
          process.env.NOTIFICATION_EMAIL.split(',').map(e => e.trim()) : [],
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        configured: resendConfigured
      };

      console.error('🔍 [EMAIL DEBUG] Resend configuration check:', JSON.stringify(envCheck, null, 2));

      if (resendConfigured) {
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Parse notification emails (support comma-separated list)
        const notificationEmails = process.env.NOTIFICATION_EMAIL
          ? process.env.NOTIFICATION_EMAIL.split(',').map(email => email.trim()).filter(email => email.length > 0)
          : [];

        if (notificationEmails.length === 0) {
          console.error('❌ No valid notification emails found after parsing');
          throw new Error('No valid notification emails configured');
        }

        console.error('📧 [EMAIL DEBUG] Sending notification emails to:', JSON.stringify(notificationEmails));
        console.error('📧 [EMAIL DEBUG] Number of recipients:', notificationEmails.length);

        // Use environment variable for from address if available, otherwise use default
        const fromAddress = process.env.RESEND_FROM_EMAIL || 'Sacratos <noreply@resend.dev>';
        console.error('📧 [EMAIL DEBUG] From address:', fromAddress);
        console.error('📧 [EMAIL DEBUG] About to call Resend API...');

        const { data, error } = await resend.emails.send({
          from: fromAddress,
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
          emailError = `Resend API error: ${JSON.stringify(error)}`;
          console.error('❌ [EMAIL ERROR] Resend API error:', error);
          console.error('❌ [EMAIL ERROR] Error details:', JSON.stringify(error, null, 2));
          console.error('❌ [EMAIL ERROR] Error name:', error.name);
          console.error('❌ [EMAIL ERROR] Error message:', error.message);

          // Handle specific Resend validation errors
          if (
            typeof error === 'object' &&
            error !== null &&
            'statusCode' in error &&
            (error as { statusCode?: number }).statusCode === 403 &&
            error.name === 'validation_error'
          ) {
            console.error('❌ [EMAIL ERROR] Resend is in testing mode. Solutions:');
            console.error('   1. Verify a domain at https://resend.com/domains');
            console.error('   2. Set RESEND_FROM_EMAIL to use your verified domain (e.g., "noreply@yourdomain.com")');
            console.error('   3. Or ensure NOTIFICATION_EMAIL matches your Resend account email (mattiastori@gmail.com)');
          }

          // Re-throw to ensure it's logged in production monitoring
          throw new Error(`Resend API error: ${JSON.stringify(error)}`);
        } else {
          emailSent = true;
          console.error(`✅ [EMAIL SUCCESS] Notification email sent successfully via Resend for: ${email}`);
          console.error('✅ [EMAIL SUCCESS] Email ID:', data?.id);
          console.error('✅ [EMAIL SUCCESS] Email data:', JSON.stringify(data, null, 2));
        }
      } else {
        const missingVars = [];
        if (!process.env.RESEND_API_KEY) missingVars.push('RESEND_API_KEY');
        if (!process.env.NOTIFICATION_EMAIL) missingVars.push('NOTIFICATION_EMAIL');

        emailError = `Missing environment variables: ${missingVars.join(', ')}`;
        console.error('❌ [EMAIL ERROR] Resend configuration not available, skipping email notification');
        console.error('❌ [EMAIL ERROR] Missing environment variables:', missingVars);
        console.error('❌ [EMAIL ERROR] Environment check:', JSON.stringify(envCheck, null, 2));

        // In production, this should be a warning but not break the subscription
        // Consider using a monitoring service to alert on this
      }
    } catch (emailErrorCaught) {
      // Enhanced error logging for production debugging
      emailError = emailErrorCaught instanceof Error ? emailErrorCaught.message : String(emailErrorCaught);
      console.error('❌ [EMAIL ERROR] Failed to send notification email via Resend');
      console.error('❌ [EMAIL ERROR] Error type:', emailErrorCaught instanceof Error ? emailErrorCaught.constructor.name : typeof emailErrorCaught);
      console.error('❌ [EMAIL ERROR] Error message:', emailErrorCaught instanceof Error ? emailErrorCaught.message : String(emailErrorCaught));
      console.error('❌ [EMAIL ERROR] Error stack:', emailErrorCaught instanceof Error ? emailErrorCaught.stack : 'No stack trace');
      console.error('❌ [EMAIL ERROR] Full error:', JSON.stringify(emailErrorCaught, Object.getOwnPropertyNames(emailErrorCaught), 2));

      // Continue execution - email sending is optional, subscription should still succeed
      // But log it prominently so it can be caught in production monitoring
    }

    // Final status log
    console.error(`📊 [EMAIL STATUS] Email sent: ${emailSent}, Error: ${emailError || 'None'}`);

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
  } finally {
    // Close Redis connection
    if (redisConnected && redis.isOpen) {
      await redis.quit();
    }
  }
}