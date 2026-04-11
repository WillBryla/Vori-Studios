export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fullName, email, business, message } = req.body;

  if (!fullName || !email || !business) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const now = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const prompt = `You are an email-sending assistant. A potential client just submitted a contact form on a web design service website. Send a notification email to williambryla07@gmail.com with ALL of the following details formatted clearly.

Contact form submission details:
- Full Name: ${fullName}
- Email: ${email}
- Business Name: ${business}
- Message: ${message || '(no message provided)'}
- Submitted: ${now} (Central Time)

Send the email now. Subject line: "New Client Inquiry — ${business}" Body should include all details above formatted neatly. Sign it as "Website Contact Agent". Send it immediately using the Gmail tool.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'mcp-client-2025-04-04',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
        mcp_servers: [
          {
            type: 'url',
            url: 'https://gmail.mcp.claude.com/mcp',
            name: 'gmail-mcp',
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(500).json({ error: data.error?.message || 'API error' });
    }

    const toolResults = data.content.filter((b) => b.type === 'mcp_tool_result');
    const textBlocks = data.content.filter((b) => b.type === 'text');
    const responseText = textBlocks.map((b) => b.text).join(' ').toLowerCase();
    const emailSent =
      toolResults.length > 0 ||
      responseText.includes('sent') ||
      responseText.includes('email');

    if (emailSent) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Email may not have sent. Check Gmail MCP auth.' });
    }
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
