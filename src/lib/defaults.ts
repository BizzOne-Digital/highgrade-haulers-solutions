import type { PageSlug } from "@/lib/models";

import { BUNDLED_IMAGES as IMG } from "@/lib/bundled-images";

export { BUNDLED_IMAGES as IMG } from "@/lib/bundled-images";

export const DEFAULT_SETTINGS = {
  businessName: "Highgrade Haulers Solutions",
  ownerName: "Darius Williams",
  phone: "(312) 610-2757",
  phoneHref: "tel:+13126102757",
  email: "hghaulers@yahoo.com",
  facebookUrl: "",
  serviceArea: "Serving Chicago and the surrounding suburbs.",
  logoUrl: "",
  announcement: "Residential & Commercial Junk Removal",
};
export type SiteSettingsData = typeof DEFAULT_SETTINGS;

export const DEFAULT_PRICING = {
  firstLoadPrice: 400,
  additionalLoadPrice: 350,
  tonsPerLoad: 2,
  discountCopy:
    "Need more than one trip? Every additional dump trailer load on the same project is $350 instead of $400, and each load still includes up to 2 tons.",
  shortNote: "Overage charges apply above 2 tons per load. Labor quoted separately.",
  overageNote:
    "Each load includes up to 2 tons. If a load goes over its 2-ton limit, the customer is responsible for the overage charges. We will talk through what you are hauling up front so there are no surprises.",
  laborNote:
    "Loading, carrying, and cleanup labor is not included in the trailer price. Labor is quoted separately based on the size of the job.",
  demolitionNote:
    "Demolition and remodeling cleanup is priced after a job assessment, so the quote reflects the actual scope of the work.",
  deliveryNote: "Material delivery rates depend on distance. Tell us where the materials are going and we will quote it.",
  quoteNote: "Free quotes are available for every service. Call, email, or send a request online.",
  paymentTerms: [
    "Dump trailer rental: payment is due upon delivery.",
    "Labor: half is due at the beginning of the job and half upon completion.",
  ],
  contractNote: "A detailed contract is provided for the customer's signature before work begins.",
  faqs: [
    {
      question: "What does the $400 price include?",
      answer:
        "$400 covers the first dump trailer load on your project, including up to 2 tons. Labor is quoted separately, and other services such as demolition cleanup and material deliveries are priced individually.",
    },
    {
      question: "How does the $350 additional load price work?",
      answer:
        "Once the first load is complete, each additional load on the same project is $350, and every load includes up to 2 tons.",
    },
    {
      question: "What happens if a load is over 2 tons?",
      answer:
        "The customer is responsible for overage charges above each load's 2-ton limit. Ask us when you request your quote and we will explain how it applies to your job.",
    },
    {
      question: "When is payment due?",
      answer:
        "Dump trailer rental payment is due upon delivery. For labor, half is due at the beginning and half upon completion. You will receive a detailed contract to sign.",
    },
    {
      question: "Is my booking confirmed when I submit the form?",
      answer:
        "No. Online submissions are booking requests. We will contact you to discuss the job and confirm a date before anything is scheduled.",
    },
    {
      question: "Do you work with contractors and homeowners?",
      answer:
        "Yes. We handle residential and commercial jobs, from garage cleanouts to construction debris removal on active job sites.",
    },
  ],
};
export type PricingData = typeof DEFAULT_PRICING;

export const DEFAULT_SERVICES = [
  {
    slug: "dump-trailer-rental",
    title: "Dump Trailer Rental",
    summary: "A practical solution for your next cleanup.",
    description:
      "Rent a dump trailer for your project. The first load is $400 with up to 2 tons included, and each additional load on the same project is $350.",
    residential: "Ideal for remodels, yard projects, and large household cleanouts you want to load at your own pace.",
    commercial: "A simple way for contractors to keep debris off the job site between project phases.",
    image: IMG.dumpHauler,
    imageAlt: "Green tandem-axle dump trailer parked on a residential driveway",
  },
  {
    slug: "junk-removal",
    title: "Junk Removal",
    summary: "Unwanted items cleared and hauled away.",
    description:
      "Old furniture, appliances, boxes, and general clutter: tell us what needs to go and we will clear it out and haul it away.",
    residential: "Furniture, appliances, basement and attic clutter, and items left behind after a move.",
    commercial: "Office furniture, fixtures, and unwanted items from retail and rental properties.",
    image: IMG.clutteredGarage,
    imageAlt: "Unwanted furniture and boxes ready for junk removal outside a garage",
  },
  {
    slug: "construction-debris-removal",
    title: "Construction Debris Removal",
    summary: "Job site debris hauled out on your schedule.",
    description:
      "We remove construction debris such as concrete, block, lumber scraps, and drywall so crews can keep working.",
    residential: "Debris left from additions, remodels, and do-it-yourself projects.",
    commercial: "Ongoing or one-time debris removal for general contractors and builders.",
    image: IMG.rubblePile,
    imageAlt: "Sorted concrete, lumber and drywall debris beside a green dump trailer",
  },
  {
    slug: "house-cleanouts",
    title: "House Cleanouts",
    summary: "Full property cleanouts, inside and out.",
    description:
      "Whole-house cleanouts for move-outs, estates, and rental turnovers, including yard debris and discarded belongings.",
    residential: "Move-outs, estate cleanouts, and homes being prepared for sale.",
    commercial: "Rental turnovers and investor properties that need to be cleared quickly.",
    image: IMG.yardDebris,
    imageAlt: "Household furniture and boxes awaiting a house cleanout beside a green trailer",
  },
  {
    slug: "garage-property-cleanouts",
    title: "Garage & Property Cleanouts",
    summary: "Homes, garages, and outdoor spaces cleared.",
    description:
      "Reclaim your garage, shed, basement, or lot. We clear out the clutter and haul it away so the space is usable again.",
    residential: "Garages, sheds, basements, and backyards.",
    commercial: "Storage areas, lots, and building exteriors.",
    image: IMG.storageGarage,
    imageAlt: "Open garage with stored household items and a cleared floor",
  },
  {
    slug: "hauling-disposal",
    title: "Hauling & Disposal",
    summary: "Loaded, hauled, and disposed of properly.",
    description: "We haul away bulky loads and take care of disposal, so you do not have to arrange multiple trips.",
    residential: "Bulky household items and yard waste that will not fit in a regular bin.",
    commercial: "Packaging, debris, and bulk waste from active sites and businesses.",
    image: IMG.siteDumpster,
    imageAlt: "Green dump trailer loaded with furniture and bags ready for hauling",
  },
  {
    slug: "material-deliveries",
    title: "Material Deliveries",
    summary: "Materials delivered where you need them.",
    description: "We deliver materials to your property or job site. Rates depend on distance, and quotes are free.",
    residential: "Landscaping and project materials delivered to your home.",
    commercial: "Material drop-offs for job sites, priced by distance.",
    image: IMG.aggregateYard,
    imageAlt: "Green dump trailer delivering landscaping gravel to a residential driveway",
  },
  {
    slug: "demolition-remodeling-cleanup",
    title: "Demolition & Remodeling Cleanup",
    summary: "Cleanup after the tear-out is done.",
    description:
      "After demolition or remodeling work, we remove the rubble and debris. Pricing follows a job assessment.",
    residential: "Kitchen, bathroom, and basement tear-outs.",
    commercial: "Interior demolition cleanup for renovations and tenant improvements.",
    image: IMG.demolition,
    imageAlt: "Wheelbarrow and sorted debris inside a home undergoing remodeling",
  },
  {
    slug: "residential-commercial-cleanup",
    title: "Residential & Commercial Cleanup",
    summary: "One crew for homes and businesses.",
    description: "Whether it is a single room or an entire job site, we handle cleanup for homeowners and businesses alike.",
    residential: "Homes, apartments, and rental units.",
    commercial: "Offices, storefronts, and construction sites.",
    image: IMG.siteWorkers,
    imageAlt: "Cleanup workers wearing safety vests beside a green trailer at a renovation site",
  },
].map((s, i) => ({ ...s, order: i, active: true }));
export type ServiceData = (typeof DEFAULT_SERVICES)[number] & { _id?: string };

/* ---------- Page content field definitions ---------- */

export type FieldType = "text" | "textarea" | "image" | "link";
export type FieldDef = { key: string; label: string; type: FieldType; default: string; group: string };

const f = (group: string, key: string, label: string, def: string, type: FieldType = "text"): FieldDef => ({
  group,
  key,
  label,
  type,
  default: def,
});

export const PAGE_FIELDS: Record<PageSlug, FieldDef[]> = {
  home: [
    f("Hero", "heroEyebrow", "Eyebrow", "JUNK REMOVAL. CLEANOUTS. HAULING."),
    f("Hero", "heroLine1", "Headline line 1", "YOU CALL."),
    f("Hero", "heroLine2", "Headline line 2", "WE CLEAN"),
    f("Hero", "heroLine3", "Headline line 3 (green)", "& HAUL."),
    f("Hero", "heroText", "Supporting text", "Reliable junk removal and property cleanouts at affordable prices.", "textarea"),
    f("Hero", "heroPrimaryCta", "Primary button label", "Get a Free Quote"),
    f("Hero", "heroPrimaryLink", "Primary button link", "/contact", "link"),
    f("Hero", "heroSecondaryCta", "Secondary button label", "Book a Pickup"),
    f("Hero", "heroSecondaryLink", "Secondary button link", "/booking", "link"),
    f("Hero", "heroNote", "Small note", "Free quotes • Residential & commercial"),
    f("Hero", "heroImage", "Hero image", IMG.jobSiteTrucks, "image"),
    f("Hero", "heroImageAlt", "Hero image alt text", "Black pickup hitched to a green dump trailer at a residential construction site"),
    f("Hero", "heroBadgeTitle", "Badge title", "DUMP TRAILER RENTAL"),
    f("Hero", "heroBadgeSub", "Badge subtext", "Up to 2 tons"),
    f("Benefits strip", "benefit1", "Benefit 1", "Flexible scheduling"),
    f("Benefits strip", "benefit2", "Benefit 2", "Clear starting prices"),
    f("Benefits strip", "benefit3", "Benefit 3", "Homes & job sites"),
    f("Services", "servicesEyebrow", "Eyebrow", "WHAT WE DO"),
    f("Services", "servicesHeading", "Heading", "BIG MESS? WE'VE GOT IT."),
    f("Services", "servicesText", "Supporting text", "From construction debris to full property cleanouts."),
    f("Services", "card1Title", "Card 1 title", "Junk Removal"),
    f("Services", "card1Text", "Card 1 text", "Unwanted items cleared and hauled away."),
    f("Services", "card1Image", "Card 1 image", IMG.clutteredGarage, "image"),
    f("Services", "card1Alt", "Card 1 image alt", "Unwanted furniture and boxes ready for junk removal outside a garage"),
    f("Services", "card1Link", "Card 1 link", "/booking?service=junk-removal", "link"),
    f("Services", "card2Title", "Card 2 title", "Dump Trailer Rental"),
    f("Services", "card2Text", "Card 2 text", "A practical solution for your next cleanup."),
    f("Services", "card2Image", "Card 2 image", IMG.dumpHauler, "image"),
    f("Services", "card2Alt", "Card 2 image alt", "Green tandem-axle dump trailer parked on a residential driveway"),
    f("Services", "card2Link", "Card 2 link", "/booking?service=dump-trailer-rental", "link"),
    f("Services", "card3Title", "Card 3 title", "Property & Job Site Cleanouts"),
    f("Services", "card3Text", "Card 3 text", "Homes, garages, and construction debris."),
    f("Services", "card3Image", "Card 3 image", IMG.yardDebris, "image"),
    f("Services", "card3Alt", "Card 3 image alt", "Household furniture and boxes awaiting a house cleanout beside a green trailer"),
    f("Services", "card3Link", "Card 3 link", "/services", "link"),
    f("Services", "alsoAvailable", "Also available line", "Material deliveries • Hauling & disposal • Demolition & remodeling cleanup"),
    f("About", "aboutEyebrow", "Eyebrow", "ABOUT US"),
    f("About", "aboutHeading", "Heading", "LOCAL HAULERS. FAIR PRICES."),
    f("About", "aboutText", "Main text", "We are a local junk removal service specializing in junk and debris cleanup and removal at affordable prices.", "textarea"),
    f("About", "aboutText2", "Second paragraph", "Owned and operated by Darius Williams, Highgrade Haulers Solutions works with homeowners, landlords, and general contractors. From a single garage cleanout to ongoing debris removal on a job site, we keep the process simple: clear pricing, a free quote, and a detailed contract before any work begins.", "textarea"),
    f("About", "aboutPoint1", "Point 1", "Free quotes on every job"),
    f("About", "aboutPoint2", "Point 2", "Clear starting prices for trailer loads"),
    f("About", "aboutPoint3", "Point 3", "Detailed contract before work begins"),
    f("About", "aboutImage", "Image", IMG.siteWorkers, "image"),
    f("About", "aboutImageAlt", "Image alt text", "Cleanup workers wearing safety vests beside a green trailer at a renovation site"),
    f("Who we serve", "audienceEyebrow", "Eyebrow", "WHO WE WORK WITH"),
    f("Who we serve", "audienceHeading", "Heading", "HOMES. JOB SITES. RENTALS."),
    f("Who we serve", "aud1Title", "Card 1 title", "Homeowners"),
    f("Who we serve", "aud1Text", "Card 1 text", "Garage, basement, and whole-house cleanouts, bulky furniture, appliances, and remodel debris.", "textarea"),
    f("Who we serve", "aud2Title", "Card 2 title", "General contractors"),
    f("Who we serve", "aud2Text", "Card 2 text", "Construction debris removal, demolition cleanup, dump trailer rental, and material deliveries to the site.", "textarea"),
    f("Who we serve", "aud3Title", "Card 3 title", "Landlords & property managers"),
    f("Who we serve", "aud3Text", "Card 3 text", "Move-out and rental turnover cleanouts so units and lots are ready for the next tenant.", "textarea"),
    f("How it works", "processEyebrow", "Eyebrow", "SIMPLE PROCESS"),
    f("How it works", "processHeading", "Heading", "THREE STEPS TO A CLEAR SPACE."),
    f("How it works", "step1Title", "Step 1 title", "Request a quote"),
    f("How it works", "step1Text", "Step 1 text", "Call, email, or send a request online. Quotes are free."),
    f("How it works", "step2Title", "Step 2 title", "Discuss the job"),
    f("How it works", "step2Text", "Step 2 text", "We talk through what needs to go, how much there is, and access on site."),
    f("How it works", "step3Title", "Step 3 title", "Schedule cleanup"),
    f("How it works", "step3Text", "Step 3 text", "We confirm a date, provide a detailed contract, and get to work."),
    f("What we take", "haulEyebrow", "Eyebrow", "WHAT WE TAKE"),
    f("What we take", "haulHeading", "Heading", "IF IT NEEDS TO GO, CALL US."),
    f("What we take", "haulItems", "Items (one per line)", "Old furniture\nAppliances\nMattresses\nConstruction debris\nDrywall & lumber scraps\nConcrete & rubble\nYard debris\nGarage & basement clutter\nRemodeling debris", "textarea"),
    f("What we take", "haulNote", "Note", "Not sure about an item? Ask when you request your quote."),
    f("What we take", "haulImage", "Image", IMG.rubblePile, "image"),
    f("What we take", "haulImageAlt", "Image alt text", "Sorted concrete, lumber and drywall debris beside a green dump trailer"),
    f("No surprises", "termsHeading", "Heading", "NO SURPRISES."),
    f("No surprises", "termsText", "Supporting text", "Straight answers on price, payment, and paperwork before the job starts."),
    f("FAQ", "faqHeading", "Heading", "QUICK ANSWERS."),
    f("Gallery", "galleryHeading", "Heading (shown only when gallery images exist)", "RECENT WORK."),
    f("Pricing", "pricingEyebrow", "Eyebrow", "STRAIGHTFORWARD PRICING"),
    f("Pricing", "pricingLine1", "Heading line 1 (white)", "MORE LOADS."),
    f("Pricing", "pricingLine2", "Heading line 2 (yellow)", "MORE VALUE."),
    f("Pricing", "pricingText", "Supporting text", "Free quotes. Pricing tailored to your project."),
    f("Pricing", "pricingLinkLabel", "Link label", "See full pricing details"),
    f("Booking strip", "bookingHeading", "Heading", "LET'S CLEAR YOUR SPACE."),
    f("Booking strip", "bookingText", "Supporting text", "Tell us what needs to go. We'll help plan the next step."),
    f("Booking strip", "bookingCta", "Button label", "Request a Booking"),
    f("Call strip", "callStripText", "Call strip text", "READY TO GET STARTED?"),
  ],
  services: [
    f("Hero", "heroEyebrow", "Eyebrow", "OUR SERVICES"),
    f("Hero", "heroHeading", "Heading", "WE HAUL IT ALL."),
    f("Hero", "heroText", "Supporting text", "We are a local junk removal service specializing in junk and debris cleanup and removal at affordable prices.", "textarea"),
    f("Hero", "heroImage", "Hero image", IMG.servicesHero, "image"),
    f("Hero", "heroImageAlt", "Hero image alt", "Cleanup workers loading unwanted furniture into a green dump trailer"),
    f("Service list", "listEyebrow", "Eyebrow", "WHAT WE DO"),
    f("Service list", "listHeading", "Heading", "SERVICES FOR HOMES & JOB SITES."),
    f("Residential & commercial", "resComHeading", "Heading", "RESIDENTIAL & COMMERCIAL."),
    f("Residential & commercial", "residentialText", "Residential text", "Homeowners, landlords, and families use us for garage and basement cleanouts, move-outs, estate cleanouts, remodel debris, and bulky item removal.", "textarea"),
    f("Residential & commercial", "commercialText", "Commercial text", "General contractors, builders, and property managers use us for construction debris removal, demolition cleanup, material deliveries, and dump trailer rental on active job sites.", "textarea"),
    f("Process", "processHeading", "Heading", "HOW IT WORKS."),
    f("Process", "step1Title", "Step 1 title", "Request a quote"),
    f("Process", "step1Text", "Step 1 text", "Call, email, or send a request online. Quotes are free."),
    f("Process", "step2Title", "Step 2 title", "Discuss the job"),
    f("Process", "step2Text", "Step 2 text", "We talk through what needs to go, how much there is, and the access on site."),
    f("Process", "step3Title", "Step 3 title", "Schedule cleanup"),
    f("Process", "step3Text", "Step 3 text", "We confirm a date, provide a detailed contract, and get to work."),
    f("Gallery", "galleryHeading", "Gallery heading (shown only when gallery images exist)", "OUR WORK."),
    f("CTA", "ctaHeading", "CTA heading", "GOT A JOB FOR US?"),
    f("CTA", "ctaText", "CTA text", "Get a free quote or send a booking request today."),
  ],
  pricing: [
    f("Hero", "heroEyebrow", "Eyebrow", "STRAIGHTFORWARD PRICING"),
    f("Hero", "heroHeading", "Heading", "CLEAR PRICES. NO GUESSWORK."),
    f("Hero", "heroText", "Supporting text", "Dump trailer loads start at a clear price. Everything else is quoted for your project, and quotes are free.", "textarea"),
    f("Hero", "heroImage", "Hero image", IMG.pricingHero, "image"),
    f("Hero", "heroImageAlt", "Hero image alt", "Black pickup and green dump trailer parked on a residential gravel driveway"),
    f("Load pricing", "cardsEyebrow", "Eyebrow", "DUMP TRAILER LOADS"),
    f("Load pricing", "cardsHeading", "Heading", "MORE LOADS. MORE VALUE."),
    f("Details", "detailsHeading", "Heading", "WHAT ELSE TO KNOW."),
    f("Payment", "paymentHeading", "Heading", "PAYMENT & CONTRACT."),
    f("FAQ", "faqHeading", "Heading", "PRICING QUESTIONS."),
    f("CTA", "ctaHeading", "CTA heading", "GET YOUR FREE QUOTE."),
    f("CTA", "ctaText", "CTA text", "Tell us about the job and we will put together a quote for your project."),
  ],
  booking: [
    f("Hero", "heroEyebrow", "Eyebrow", "BOOK A PICKUP"),
    f("Hero", "heroHeading", "Heading", "LET'S CLEAR YOUR SPACE."),
    f("Hero", "heroText", "Supporting text", "Send a booking request with the details of your job. We will contact you to confirm the date and next steps.", "textarea"),
    f("Hero", "heroImage", "Hero image", IMG.bookingHero, "image"),
    f("Hero", "heroImageAlt", "Hero image alt", "Cleanup worker arriving beside a green trailer for a residential pickup"),
    f("Form", "formHeading", "Form heading", "BOOKING REQUEST"),
    f("Form", "formIntro", "Form intro", "Your preferred date is a request, not a confirmed appointment. No payment is required to submit.", "textarea"),
    f("Form", "successTitle", "Success title", "REQUEST RECEIVED."),
    f("Form", "successText", "Success text", "Thank you. Your booking request has been saved and is pending confirmation. We will contact you to confirm availability and details. Your preferred date is not confirmed until we reach out.", "textarea"),
    f("Sidebar", "sidebarHeading", "Sidebar heading", "PREFER TO TALK?"),
    f("Sidebar", "sidebarText", "Sidebar text", "Call or email us directly and we will help you plan the job.", "textarea"),
  ],
  contact: [
    f("Hero", "heroEyebrow", "Eyebrow", "CONTACT US"),
    f("Hero", "heroHeading", "Heading", "GET A FREE QUOTE."),
    f("Hero", "heroText", "Supporting text", "Questions, quotes, or a job you want to plan: reach out and we will get back to you.", "textarea"),
    f("Hero", "heroImage", "Hero image", IMG.contactHero, "image"),
    f("Hero", "heroImageAlt", "Hero image alt", "Cleanup worker speaking on the phone beside a black pickup and green trailer"),
    f("Form", "formHeading", "Form heading", "SEND A MESSAGE"),
    f("Form", "formIntro", "Form intro", "Tell us a little about the job. Free quotes are available for every service.", "textarea"),
    f("Form", "successTitle", "Success title", "MESSAGE RECEIVED."),
    f("Form", "successText", "Success text", "Thank you. Your message has been saved and we will get back to you as soon as possible.", "textarea"),
    f("Details", "detailsHeading", "Contact details heading", "REACH US DIRECTLY"),
  ],
};

export const DEFAULT_SEO: Record<PageSlug, { seoTitle: string; seoDescription: string }> = {
  home: {
    seoTitle: "Highgrade Haulers Solutions | Junk Removal, Cleanouts & Hauling",
    seoDescription:
      "Residential and commercial junk removal, property cleanouts, construction debris removal, and dump trailer rental at affordable prices. Free quotes.",
  },
  services: {
    seoTitle: "Services | Highgrade Haulers Solutions",
    seoDescription:
      "Dump trailer rental, junk removal, construction debris removal, house and garage cleanouts, hauling, material deliveries, and demolition cleanup.",
  },
  pricing: {
    seoTitle: "Pricing | Highgrade Haulers Solutions",
    seoDescription:
      "Dump trailer loads from $400 with up to 2 tons included, and $350 for each additional load on the same project. Free quotes for every service.",
  },
  booking: {
    seoTitle: "Book a Pickup | Highgrade Haulers Solutions",
    seoDescription:
      "Send a booking request for junk removal, cleanouts, hauling, or dump trailer rental. We will contact you to confirm details. No payment required.",
  },
  contact: {
    seoTitle: "Contact | Highgrade Haulers Solutions",
    seoDescription: "Call (312) 610-2757 or send a message for a free junk removal, cleanout, or hauling quote.",
  },
};

export function defaultFields(slug: PageSlug): Record<string, string> {
  return Object.fromEntries(PAGE_FIELDS[slug].map((d) => [d.key, d.default]));
}

export const PROPERTY_TYPES = ["Residential", "Commercial", "Construction / job site", "Other"];
