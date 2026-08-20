export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ message: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Proxying subscription to Substack for email: ${email}`);

    const substackResponse = await fetch('https://extremerituals.substack.com/api/v1/free', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!substackResponse.ok) {
      const errorText = await substackResponse.text();
      console.error('Substack API error:', errorText);
      
      if (substackResponse.status === 409) {
        return new Response(JSON.stringify({ message: 'Email already subscribed!' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ message: 'Failed to subscribe. Please try again later.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully subscribed ${email} to Extreme Rituals on Substack`);

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