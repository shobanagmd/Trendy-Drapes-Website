import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-12 flex-1 max-w-3xl">
      <h1 className="font-display text-4xl font-semibold text-foreground mb-6">About Trendy Drapes</h1>
      <div className="font-body text-sm text-muted-foreground space-y-4 leading-relaxed">
        <p>Trendy Drapes is a premium ethnic wear destination, curating the finest handcrafted sarees, lehengas, and indo-western outfits from master artisans across India.</p>
        <p>Founded in 2024, we are passionate about preserving India's rich textile heritage while making it accessible to the modern woman. Every piece in our collection tells a story — of the weaver's skill, the fabric's journey, and the tradition it carries.</p>
        <p>Our mission is to bring authentic, luxurious ethnic wear to your doorstep, ensuring every drape makes you feel confident and beautiful.</p>
        <h2 className="font-display text-2xl font-semibold text-foreground pt-4">Our Promise</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>100% authentic handcrafted products</li>
          <li>Ethically sourced fabrics</li>
          <li>Supporting local artisan communities</li>
          <li>Premium quality with attention to detail</li>
        </ul>
      </div>
    </div>
    <Footer />
  </div>
);

export default About;
