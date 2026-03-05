import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>BlackRoad OS</title>
        <meta name="description" content="Microservice infrastructure management for the BlackRoad ecosystem" />
      </head>
      <body>{children}</body>
    </html>
  );
}
