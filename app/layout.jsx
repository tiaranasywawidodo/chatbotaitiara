export const metadata = {
  title: 'AITIARA',
  description: 'Chatbot AI yang ramah dan membantu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}