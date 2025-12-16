export const metadata = {
  title: 'ANSAL AI',
  description: 'Chatbot AI yang ramah dan membantu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}