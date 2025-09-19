export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-700 via-gray-500 to-slate-700">
      <div className="shadow-xl rounded-2xl p-8 sm:p-10 w-full max-w-md animate-fadeIn">
        {children}
      </div>
    </div>
  );
}
