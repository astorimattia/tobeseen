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

    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('source', 'sacratos');

    const substackResponse = await fetch('https://extremerituals.substack.com/api/v1/free?nojs=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      body: formData.toString(),
      redirect: 'manual',
    });

    const status = substackResponse.status;
    
    if (status === 302 || (status >= 200 && status < 300)) {
      console.log(`Successfully subscribed ${email} to Extreme Rituals on Substack (status: ${status})`);
      return new Response(JSON.stringify({ message: 'Subscription successful!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const responseText = await substackResponse.text();
    console.error(`Substack API error (${status}):`, responseText);
    
    if (status === 409) {
      return new Response(JSON.stringify({ message: 'Email already subscribed!' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (status === 400) {
      try {
        const errorData = JSON.parse(responseText);
        const errorMessage = errorData.message || errorData.error || 'Please enter a valid email address';
        return new Response(JSON.stringify({ message: errorMessage }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify({ message: 'Please enter a valid email address' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    return new Response(JSON.stringify({ message: 'Failed to subscribe. Please try again later.' }), {
      status: 500,
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