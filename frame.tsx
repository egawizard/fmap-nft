import { Frog } from 'frog'
   
   export const app = new Frog({
     title: 'FMAP NFT Minter'
   })
   
   app.frame('/', (c) => {
     return c.res({
       image: (
         <div style={{ 
           display: 'flex', 
           flexDirection: 'column',
           alignItems: 'center',
           justifyContent: 'center',
           background: 'linear-gradient(to bottom, #9333ea, #3b82f6)',
           height: '100%',
           color: 'white',
           fontSize: 60
         }}>
           <div>FARCASTER MAP</div>
           <div style={{ fontSize: 30 }}>Mint Your Pixel Art NFT</div>
           <div style={{ fontSize: 40 }}>$0.25 on Base</div>
         </div>
       ),
       intents: [
         <Button.Link href="https://fmap-nft.vercel.app">Mint Now</Button.Link>,
       ]
     })

   })
