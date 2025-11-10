// Vercel Serverless Function for Farcaster Frame
// Save this as: api/frame.js

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return frame response
  const frameHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://fmap-nft.vercel.app/og-image.png" />
        <meta property="fc:frame:image:aspect_ratio" content="1:1" />
        <meta property="fc:frame:button:1" content="🎨 Mint Now" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="https://fmap-nft.vercel.app" />
        <meta property="fc:frame:button:2" content="📊 View Contract" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="https://basescan.org/address/0xf9bb77aA3C2F5e7A3387331aa596269fE5920bF3" />
        <meta property="fc:frame:post_url" content="https://fmap-nft.vercel.app/api/frame" />
      </head>
      <body>
        <h1>FMAP - Farcaster Map NFT</h1>
      </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(frameHtml);
}
