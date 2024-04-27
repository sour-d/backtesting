export const metadata = {
  title: "Trading System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
