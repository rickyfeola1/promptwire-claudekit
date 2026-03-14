export default async function handler(req, res) {

  // Allow CORS for your domain
  res.setHeader('Access-Control-Allow-Origin', 'https://www.promptwireai.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, automation_id } = req.body;

  // Validate email
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;
  const API_KEY = process.env.BEEHIIV_API_KEY;

  // Use automation_id passed from the form, or fall back to default
  const AUTOMATION_ID = automation_id || process.env.BEEHIIV_AUTOMATION_ID;

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          email: email,
          reactivate_existing: true,
          send_welcome_email: false,
          automation_id: AUTOMATION_ID
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Beehiiv API error:', data);
      return res.status(500).json({ error: 'Subscription failed' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
