const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");

const doc = new Document({
    sections: [{
        properties: {},
        children: [
            new Paragraph({
                text: "HOPE LABS",
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                text: "Web Platform Proposal & Solar Power Calculator Project\n",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Prepared By: ", bold: true }),
                    new TextRun("Hope Labs\t\t\t"),
                    new TextRun({ text: "Client: ", bold: true }),
                    new TextRun("Sara Power Solutions\n"),
                    
                    new TextRun({ text: "Project: ", bold: true }),
                    new TextRun("Solar Catalog & Sizing Engine\t"),
                    new TextRun({ text: "Domain: ", bold: true }),
                    new TextRun("sarapowersolutions.com\n"),
                    
                    new TextRun({ text: "Base Investment: ", bold: true }),
                    new TextRun("25,000 ETB\t\t\t"),
                    new TextRun({ text: "Payment Terms: ", bold: true }),
                    new TextRun("2-Phase Split (50% / 50%)\n"),
                ]
            }),
            new Paragraph({ text: "1. Executive Summary", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({
                text: "Hope Labs is pleased to present this technical proposal for the design, development, and deployment of the Sara Power Solutions web platform. The platform integrates a modern luxury product showcase with an advanced interactive Solar Power Engineering Calculator to deliver a high-converting digital experience for your customers.",
            }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Luxury Kith-Style Showcase: ", bold: true }),
                    new TextRun("A mobile-first, edge-to-edge cinematic product catalog featuring a category drill-down system, dark/light mode, and instant WhatsApp/Telegram lead generation."),
                ]
            }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "FR-2 Solar Sizing Engine: ", bold: true }),
                    new TextRun("An interactive dual-mode tool allowing customers to enter their household appliance loads (or direct kW limits) and receive mathematically matched inverter, battery, and panel recommendations. It includes one-click PDF engineering report generation."),
                ]
            }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Dynamic Admin Portal: ", bold: true }),
                    new TextRun("A highly secure dashboard allowing admins to control the entire platform without a developer. This includes uploading hero carousel banners, managing the product inventory with strict technical attributes, and modifying branding and social media telemetry."),
                ]
            }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Cloud Hosting Infrastructure: ", bold: true }),
                    new TextRun("Next.js 14 full-stack framework deployed on Vercel's Global Edge Network, backed by a Supabase PostgreSQL cloud database featuring Realtime data synchronization."),
                ]
            }),
            new Paragraph({ text: "2. Household Solar Power Calculator Specification", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: "The calculator acts as an automated digital engineer, simplifying decision-making for customers seeking solar solutions:" }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Interactive Data Input: ", bold: true }),
                    new TextRun("Customers either select their household appliances and runtimes (Checklist Mode) or input their precise peak kW demand and daily kWh energy requirements (Direct Mode)."),
                ]
            }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Algorithmic Matching: ", bold: true }),
                    new TextRun("The engine calculates systemic efficiency losses and queries the live Supabase inventory to find exact matches for Inverter capacity (kVA), Battery storage (kWh), and Panel wattage (Wp)."),
                ]
            }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Intelligent Packaging: ", bold: true }),
                    new TextRun("It generates 3 distinct tiered packages (Essential Backup, Hybrid Kit, Master Kit) allowing clients to choose their level of investment, and provides a direct 'Send Inquiry' bridge to WhatsApp."),
                ]
            }),
            new Paragraph({ text: "3. Investment & Payment Milestones", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: "The total base investment for the complete platform is 25,000 ETB, structured in 2 equal milestones:" }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Phase 1: Kickoff Deposit (50%) - 12,500 ETB\n", bold: true }),
                    new TextRun("Paid prior to development start. Covers database schema, product attribute setup, UI/UX design wireframing, and core catalog engineering.\n"),
                    new TextRun({ text: "Phase 2: Final Go-Live (50%) - 12,500 ETB\n", bold: true }),
                    new TextRun("Paid upon reviewing and approving the live staging demo prior to pointing the primary domain live."),
                ]
            }),
            new Paragraph({ text: "4. Scope Revisions & Additional Features Policy", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Included in Base Price: ", bold: true }),
                    new TextRun("Standard review feedback, minor design adjustments, text edits, and layout refinements during the Phase 2 demo."),
                ]
            }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Major Scope Additions: ", bold: true }),
                    new TextRun("If future feedback introduces completely new modules outside the agreed scope (e.g., payment gateway integration, custom mobile apps, multi-vendor logistics), these will be quoted transparently as add-ons prior to implementation."),
                ]
            }),
            new Paragraph({ text: "5. System Maintenance & Management Options", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: "Sara Power Solutions can select one of the following two ongoing management models after launch:" }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Option A: Managed Service & Maintenance (Recommended)\n", bold: true }),
                    new TextRun("Hope Labs retains administrative management on Vercel & Supabase. Hope Labs provides uptime monitoring, database backups, content updates, and technical support under a monthly/quarterly retainer.\n\n"),
                    new TextRun({ text: "Option B: Client Ownership with Admin Access (Hybrid)\n", bold: true }),
                    new TextRun("Sara Power Solutions registers its own Vercel & Supabase accounts for 100% legal ownership and hosting billing. Hope Labs is invited as an Admin/Developer to perform regular updates and maintenance."),
                ]
            }),
            new Paragraph({ text: "\n\n___________________________\nPrepared By: Hope Labs (Signature & Date)\n\n", alignment: AlignmentType.RIGHT }),
            new Paragraph({ text: "___________________________\nAccepted By: Sara Power Solutions (Signature & Date)", alignment: AlignmentType.RIGHT })
        ],
    }],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("Hope_Labs_Sara_Power_Proposal.docx", buffer);
    console.log("Document created successfully!");
});
