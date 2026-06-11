import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden font-sans bg-[#0a0a14]">
      <Navbar />

      {/* Deep space background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,90,200,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[32px_32px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 pt-32 pb-24 w-full max-w-4xl mx-auto">
        <div className="w-full bg-white/4 border border-white/8 backdrop-blur-xl p-10 md:p-16 rounded-3xl shadow-[0_0_80px_rgba(59,130,246,0.05)] text-left">
          <h1 className="text-4xl md:text-5xl font-serif font-light text-white tracking-tighter mb-8 border-b border-white/10 pb-6">
            Privacy Policy
          </h1>
          <div className="space-y-6 text-white/60 font-light leading-relaxed text-sm">
            <p>
              At <strong className="text-white">Marketme</strong>, we take your privacy seriously. This policy describes what personal information we collect and how we use it. 
            </p>
            <h3 className="text-lg text-white font-serif mt-8 mb-3">1. Information Collection</h3>
            <p>
              We collect information to provide better services to all our users. We collect information in the following ways: information you give us, and information we get from your use of our services.
            </p>
            <h3 className="text-lg text-white font-serif mt-8 mb-3">2. Use of Data</h3>
            <p>
              We use the information we collect from all of our services to provide, maintain, protect and improve them, to develop new ones, and to protect Marketme and our users.
            </p>
            <h3 className="text-lg text-white font-serif mt-8 mb-3">3. Data Security</h3>
            <p>
              We work hard to protect Marketme and our users from unauthorized access to or unauthorized alteration, disclosure or destruction of information we hold. We are SOC2 Type II certified.
            </p>
            <p className="mt-12 text-white/30 text-xs italic">
              Last updated: June 2026. This is a placeholder for demonstration purposes.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
