import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <main className="h-screen w-full max-w-4xl bg-white shadow-2xl">
        <ChatWidget />
      </main>
    </div>
  );
}
