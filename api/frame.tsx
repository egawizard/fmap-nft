// api/frame.js - Vercel Serverless Function
// Handle Farcaster Frame button interactions

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse Frame data dari Farcaster
    const { untrustedData, trustedData } = req.body;
    
    // untrustedData berisi:
    // - fid: Farcaster ID user
    // - buttonIndex: tombol mana yang diklik (1, 2, 3, atau 4)
    // - inputText: text input dari user (jika ada)
    // - castId: ID cast yang berisi frame ini
    
    const buttonIndex = untrustedData?.buttonIndex || 1;
    const fid = untrustedData?.fid;
    const inputText = untrustedData?.inputText || '';

    console.log('Frame interaction:', { buttonIndex, fid, inputText });

    // Ambil data mint dari contract (opsional)
    // Anda bisa query ke RPC Base untuk data real-time
    let totalMinted = 0;
    let remaining = 10000;

    try {
      // Example: Query contract untuk total minted
      const response = await fetch('https://mainnet.base.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{
            to: '0xf9bb77aA3C2F5e7A3387331aa596269fE5920bF3',
            data: '0x5b92ac0d' // totalMinted() function selector
          }, 'latest']
        })
      });

      const data = await response.json();
      if (data.result) {
        totalMinted = parseInt(data.result, 16);
        remaining = 10000 - totalMinted;
      }
    } catch (error) {
      console.error('Contract query error:', error);
    }

    // Response berdasarkan button yang diklik
    let frameHtml = '';

    if (buttonIndex === 1) {
      // Button 1: Launch Mint App
      frameHtml = generateFrameHtml({
        image: `${getBaseUrl(req)}/frame-image.png`,
        title: 'FMAP - Ready to Mint!',
        buttons: [
          { label: 'Open Mint App', action: 'link', target: getBaseUrl(req) },
          { label: 'View Collection', action: 'link', target: 'https://basescan.org/address/0xf9bb77aA3C2F5e7A3387331aa596269fE5920bF3' }
        ],
        postUrl: `${getBaseUrl(req)}/api/frame`
      });
    } else if (buttonIndex === 2) {
      // Button 2: View on BaseScan
      frameHtml = generateFrameHtml({
        image: `${getBaseUrl(req)}/frame-image.png`,
        title: 'FMAP Collection on Base',
        buttons: [
          { label: 'Back to Mint', action: 'post', target: null },
          { label: 'Open BaseScan', action: 'link', target: 'https://basescan.org/address/0xf9bb77aA3C2F5e7A3387331aa596269fE5920bF3' }
        ],
        postUrl: `${getBaseUrl(req)}/api/frame`
      });
    } else if (buttonIndex === 3) {
      // Button 3: Check Stats
      frameHtml = generateStatsFrame({
        totalMinted,
        remaining,
        baseUrl: getBaseUrl(req)
      });
    } else {
      // Default frame
      frameHtml = generateFrameHtml({
        image: `${getBaseUrl(req)}/frame-image.png`,
        title: 'FMAP - Farcaster Map NFT',
        buttons: [
          { label: 'Launch Mint App', action: 'link', target: getBaseUrl(req) },
          { label: 'View Collection', action: 'link', target: 'https://basescan.org/address/0xf9bb77aA3C2F5e7A3387331aa596269fE5920bF3' }
        ],
        postUrl: `${getBaseUrl(req)}/api/frame`
      });
    }

    // Return HTML dengan Frame meta tags
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(frameHtml);

  } catch (error) {
    console.error('Frame API error:', error);
    
    // Return error frame
    const errorHtml = generateFrameHtml({
      image: `${getBaseUrl(req)}/frame-image.png`,
      title: 'FMAP - Error',
      buttons: [
        { label: 'Try Again', action: 'post', target: null },
        { label: 'Visit Website', action: 'link', target: getBaseUrl(req) }
      ],
      postUrl: `${getBaseUrl(req)}/api/frame`
    });

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(errorHtml);
  }
}

// Helper: Generate Frame HTML
function generateFrameHtml({ image, title, buttons, postUrl, inputText = null }) {
  const buttonTags = buttons.map((btn, index) => {
    const i = index + 1;
    let tags = `<meta property="fc:frame:button:${i}" content="${btn.label}" />`;
    
    if (btn.action) {
      tags += `\n    <meta property="fc:frame:button:${i}:action" content="${btn.action}" />`;
    }
    
    if (btn.target) {
      tags += `\n    <meta property="fc:frame:button:${i}:target" content="${btn.target}" />`;
    }
    
    return tags;
  }).join('\n    ');

  const inputTag = inputText 
    ? `<meta property="fc:frame:input:text" content="${inputText}" />`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <!-- Farcaster Frame Tags -->
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${image}" />
  <meta property="fc:frame:image:aspect_ratio" content="1:1" />
  <meta property="fc:frame:post_url" content="${postUrl}" />
  ${inputTag}
  ${buttonTags}
  
  <!-- Open Graph -->
  <meta property="og:title" content="${title}" />
  <meta property="og:image" content="${image}" />
</head>
<body>
  <h1>${title}</h1>
  <p>This is a Farcaster Frame. View in Warpcast to interact.</p>
</body>
</html>`;
}

// Helper: Generate Stats Frame with dynamic image
function generateStatsFrame({ totalMinted, remaining, baseUrl }) {
  // Anda bisa generate dynamic image di sini
  // Atau gunakan service seperti Vercel OG Image
  
  return generateFrameHtml({
    image: `${baseUrl}/frame-image.png`,
    title: `FMAP Stats: ${totalMinted}/10000 Minted`,
    buttons: [
      { label: '← Back', action: 'post', target: null },
      { label: 'Mint Now', action: 'link', target: baseUrl },
      { label: 'Refresh Stats', action: 'post', target: null }
    ],
    postUrl: `${baseUrl}/api/frame`
  });
}

// Helper: Get base URL
function getBaseUrl(req) {
  const host = req.headers.host || 'fmap-nft.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}