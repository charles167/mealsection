import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { RiCustomerService2Fill } from "react-icons/ri";
import { BiSupport } from "react-icons/bi";
import { FiClock } from "react-icons/fi";
import { useState } from "react";
import SEO from "../components/SEO";
import { PAGE_SEO } from "../utils/seo";

function Contact() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqData = [
    {
      category: "About MealSection",
      questions: [
        {
          q: "What is MealSection?",
          a: "MealSection is a campus-based web application that connects students, staff, and visitors to local eateries. Our platform offers fast, convenient, and reliable access to meals within the campus.",
        },
        {
          q: "Who can use MealSection?",
          a: "Anyone on campus with a valid campus ID can create an account, top up their wallet, and place orders for delivery or pickup.",
        },
        {
          q: "How do I sign up?",
          a: "Visit the MealSection web app, click Sign Up, provide your campus email or phone number, set a password, and verify your account. Once verified, you can top up your wallet and place orders.",
        },
      ],
    },
    {
      category: "Ordering & Wallet System",
      questions: [
        {
          q: "How do I place an order?",
          a: "1. Top up your MealSection wallet via the web app. 2. Browse restaurant menus and select items. 3. Add items to your cart and provide any special instructions. 4. Confirm your delivery or pickup option and complete the order using your wallet balance.",
        },
        {
          q: "Can I modify or cancel my order?",
          a: "Orders can be modified or canceled only before the restaurant starts preparing the food. Once preparation begins, changes are not possible.",
        },
        {
          q: "Can I customize my meals?",
          a: "Yes. You can add special instructions for dietary preferences, ingredient adjustments, or portion sizes.",
        },
        {
          q: "How does the wallet system work?",
          a: "All orders are paid using your MealSection wallet. Top up your wallet in advance via debit/credit card or campus payment systems. Refunds for canceled or incorrect orders are credited back to your wallet only; no cash or bank refunds are allowed.",
        },
      ],
    },
    {
      category: "Delivery & Pickup",
      questions: [
        {
          q: "How long does delivery take?",
          a: "Delivery typically takes 20–45 minutes, depending on your location and the restaurant.",
        },
        {
          q: "Can I pick up my order instead of delivery?",
          a: "Yes. Select the 'Pickup' option at checkout and collect your order directly from the restaurant.",
        },
        {
          q: "What if I am not available at my delivery location?",
          a: "If you are unreachable or not at your specified delivery location when our delivery team contacts you, and the estimated waiting time of 10 minutes passes, the order may be canceled, and the wallet will not be refunded. Please ensure your delivery location is accurate and that you are reachable.",
        },
      ],
    },
    {
      category: "Payment",
      questions: [
        {
          q: "What payment methods are accepted?",
          a: "Wallet top-ups can be made via debit/credit card or campus payment systems. Orders are paid entirely from your wallet balance.",
        },
        {
          q: "Is my payment information secure?",
          a: "Yes. MealSection uses secure, encrypted gateways to protect your personal and financial data.",
        },
      ],
    },
    {
      category: "Tracking & Notifications",
      questions: [
        {
          q: "Can I track my order?",
          a: "Yes. MealSection provides real-time updates from preparation to delivery.",
        },
        {
          q: "How will I be notified?",
          a: "Notifications are sent via the web app at each stage of the order: received, cooking, out for delivery, and delivered.",
        },
      ],
    },
    {
      category: "Account & Profile",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on the login page and follow the instructions to reset via your registered email or phone number.",
        },
        {
          q: "Can I save multiple delivery addresses?",
          a: "Yes. Store multiple addresses in your profile for quicker checkouts in the future.",
        },
      ],
    },
    {
      category: "Issues, Cancellations & Refunds",
      questions: [
        {
          q: "How do I cancel an order?",
          a: "Orders can be canceled before preparation begins. After this, cancellations are not possible.",
        },
        {
          q: "What if my order is incorrect or missing items?",
          a: "Contact MealSection support via the web app immediately. Any adjustments will be credited to your wallet.",
        },
        {
          q: "How does the refund process work?",
          a: "All refunds are credited only to your MealSection wallet. No cash or bank refunds are provided.",
        },
      ],
    },
    {
      category: "Vendors & Partnerships",
      questions: [
        {
          q: "How can a restaurant partner with MealSection?",
          a: "Restaurants can apply via the Vendor Onboarding page, providing business details, menu, and compliance with campus food safety standards.",
        },
        {
          q: "Are there fees for vendors?",
          a: "Yes. A small commission applies to each order to cover platform maintenance and marketing.",
        },
      ],
    },
    {
      category: "Safety & Food Quality",
      questions: [
        {
          q: "How does MealSection ensure food safety?",
          a: "MealSection partners exclusively with school-approved campus vendors that follow strict hygiene and food safety protocols. Deliveries are carefully packaged to maintain temperature, freshness, and quality. Our delivery team is trained in safe handling practices, ensuring that meals arrive in optimal condition.",
        },
        {
          q: "What measures are in place for quality assurance?",
          a: "All vendors undergo inspection and approval by the school. Regular quality checks and ratings by users help maintain standards. Orders are packed in sealed containers, with attention to temperature control. Any reported issue with quality is addressed promptly, with wallet credit adjustments if necessary.",
        },
      ],
    },
    {
      category: "Support & Feedback",
      questions: [
        {
          q: "How can I contact MealSection support?",
          a: "Via in-app chat, email at mealsection@gmail.com, or call 07013234960.",
        },
        {
          q: "Can I leave feedback or rate a restaurant?",
          a: "Yes. After every order, you can rate your experience and provide comments to help improve service quality.",
        },
      ],
    },
  ];
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen text-gray-800">
      <SEO
        title={PAGE_SEO.contact.title}
        description={PAGE_SEO.contact.description}
        keywords={PAGE_SEO.contact.keywords}
      />
      {/* Local animations */}
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
        .contact-reveal { opacity: 0; animation: fadeUp .5s ease-out forwards }
      `}</style>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white py-10 px-4">
        <div
          className="max-w-4xl mx-auto text-center contact-reveal"
          style={{ animationDelay: "40ms" }}
        >
          <div className="w-16 h-16 mx-auto mb-3 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center ring-1 ring-white/20 transform-gpu">
            <BiSupport size={30} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Contact Us
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-sm md:text-base">
            We'd love to hear from you! Whether you have a question, complaint,
            feedback, or need support, our team is here to help.
          </p>
        </div>
      </div>

      {/* Contact Options */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Email Card */}
          <div className="contact-reveal" style={{ animationDelay: "80ms" }}>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 transform-gpu hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-red-200/60">
                  <MdEmail size={22} className="text-[var(--default)]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-0.5 text-base">
                    Email Us
                  </p>
                  <a
                    href="mailto:mealsection@gmail.com"
                    aria-label="Email MealSection support"
                    className="text-gray-600 hover:text-[var(--default)] transition-colors text-sm"
                  >
                    mealsection@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Card */}
          <div className="contact-reveal" style={{ animationDelay: "120ms" }}>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 transform-gpu hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-emerald-200/60">
                  <MdPhone size={22} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-0.5 text-base">
                    Call/Message
                  </p>
                  <a
                    href="tel:07013234960"
                    aria-label="Call MealSection support"
                    className="text-gray-600 hover:text-green-600 transition-colors text-sm"
                  >
                    07013234960
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Hours */}
        <div className="contact-reveal" style={{ animationDelay: "160ms" }}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center ring-1 ring-indigo-200/60">
                <FiClock size={20} className="text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                Support Hours
              </h3>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <p className="text-center text-green-700 font-semibold text-base">
                🕐 24 Hours - Always Available
              </p>
              <p className="text-center text-green-600 text-sm mt-1">
                We're here for you anytime, every day
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="contact-reveal" style={{ animationDelay: "200ms" }}>
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">❓</span>
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              {faqData.map((category, catIdx) => (
                <div key={catIdx} className="space-y-3">
                  <h4 className="text-base font-bold text-gray-800 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2 rounded-lg border-l-4 border-[var(--default)]">
                    {category.category}
                  </h4>
                  <div className="space-y-2 pl-2">
                    {category.questions.map((item, qIdx) => {
                      const id = `${catIdx}-${qIdx}`;
                      const isOpen = openFaq === id;
                      return (
                        <div
                          key={qIdx}
                          className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all hover:shadow-sm"
                        >
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : id)}
                            className="w-full text-left p-4 flex items-start justify-between gap-3 group"
                          >
                            <span className="font-medium text-gray-900 text-sm group-hover:text-[var(--default)] transition-colors flex-1">
                              {item.q}
                            </span>
                            <span
                              className={`text-gray-500 transition-transform flex-shrink-0 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            >
                              ▾
                            </span>
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4">
                              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                {item.a}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
