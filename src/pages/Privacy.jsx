import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-12 flex-1 max-w-3xl">
      <h1 className="font-display text-4xl font-semibold text-foreground mb-6">Privacy Policy</h1>
      <div className="font-body text-sm text-muted-foreground space-y-4 leading-relaxed">
        <p>At Trendy Drapes, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.</p>
        <h2 className="font-display text-2xl font-semibold text-foreground pt-4">Information We Collect</h2>
        <p>We collect information you provide directly to us, such name, email address, shipping address, and payment information when you make a purchase.</p>
        <h2 className="font-display text-2xl font-semibold text-foreground pt-4">How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>To process and fulfill your orders</li>
          <li>To communicate with you about your orders</li>
          <li>To send promotional emails (with your consent)</li>
          <li>To improve our website and services</li>
        </ul>
        <h2 className="font-display text-2xl font-semibold text-foreground pt-4">Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or destruction.</p>
        <h2 className="font-display text-2xl font-semibold text-foreground pt-4">Contact</h2>
        <p>For any privacy-related questions, please contact us at care@trendydrapes.com.</p>
      </div>
    </div>
    <Footer />
  </div>
);

export default Privacy;
