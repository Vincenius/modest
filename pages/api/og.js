import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'experimental-edge',
};

export default function handler(req, res) {
  const { searchParams } = new URL(req.url)
  const hasTitle = searchParams.has('title');
  const hasDescription = searchParams.has('description');
  const hasImage = searchParams.has('image');
  const hasTheme = searchParams.has('theme');

  const title = hasTitle
    ? searchParams.get('title')?.slice(0, 100)
    : 'Modest';

  const description = hasDescription
    ? searchParams.get('description')?.slice(0, 200)
    : 'An open-source micro-blogging platform to create your own twitter-like blog for free.';

  const image = hasImage // todo image for generated pattern
    ? decodeURI(searchParams.get('image'))
    : 'linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%)';

  const theme = hasTheme
    ? searchParams.get('theme')
    : 'dark'

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          background: image,
          backgroundSize: hasImage ? 'cover' : '',
          backgroundPosition: hasImage ? 'center' : 'initial',
          width: '100%',
          height: '100%',
          padding: '5em',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: theme === 'dark' ? '#000' : '#fff',
        }}
      >
        { hasImage && <div style={{
          background: theme === 'light'
            ? 'linear-gradient(0deg, #000 0%, transparent 75%)'
            : 'linear-gradient(0deg, #fff 0%, transparent 75%)',
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100vw',
          height: '100vh',
        }}></div> }
        <h1 style={{ fontSize: 76, textTransform: 'uppercase' }}>{ title }</h1>
        <h2 style={{ fontSize: 32 }}>{ description }</h2>
        <p style={{
          fontSize: 16,
          color: theme === 'dark' ? '#000' : '#fff',
          opacity: 0.7,
          position: 'absolute',
          bottom: '0',
          right: '20px',
        }}>created with modest.app</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
