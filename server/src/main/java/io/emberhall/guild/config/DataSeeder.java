package io.emberhall.guild.config;

import io.emberhall.guild.domain.*;
import io.emberhall.guild.repo.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final JobRepository jobs;
    private final ProposalRepository proposals;
    private final ContractRepository contracts;
    private final ConversationRepository conversations;
    private final MessageRepository messages;
    private final ReviewRepository reviews;
    private final NotificationRepository notifications;
    private final LedgerEntryRepository ledger;
    private final PasswordEncoder encoder;
    private final boolean enabled;

    public DataSeeder(UserRepository users, JobRepository jobs, ProposalRepository proposals,
                      ContractRepository contracts, ConversationRepository conversations,
                      MessageRepository messages, ReviewRepository reviews,
                      NotificationRepository notifications, LedgerEntryRepository ledger,
                      PasswordEncoder encoder, @Value("${app.seed.enabled:true}") boolean enabled) {
        this.users = users;
        this.jobs = jobs;
        this.proposals = proposals;
        this.contracts = contracts;
        this.conversations = conversations;
        this.messages = messages;
        this.reviews = reviews;
        this.notifications = notifications;
        this.ledger = ledger;
        this.encoder = encoder;
        this.enabled = enabled;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled || users.count() > 0) {
            return;
        }

        User aeryn = user("Aeryn Cael", "aeryncael", "patron@emberhall.io", Enums.Role.PATRON,
                "Patron of the Ember Court", "The Emberhold", "", 0, 0, 0, 12,
                new BigDecimal("1240.00"), true, "#8c1c1c",
                "Keeper of the Ember Court and patron of three halls. I commission work that outlasts the season.",
                "The Emberhold", 420);
        User aelira = user("Aelira Voss", "aeliravoss", "artisan@emberhall.io", Enums.Role.ARTISAN,
                "Forgemaster of Systems", "The Forge",
                "Java, Spring Boot, React, PostgreSQL, WebSocket", 95, 4.9, 47, 52,
                new BigDecimal("8640.00"), true, "#c9a227",
                "I build systems that hold under siege. Twelve years in the forge, from payment vaults to real time halls. I take few oaths and keep every one.",
                "The Forge", 680);

        User rowan = artisan("Rowan Vey", "rowanvey", "The Atelier",
                "Banner Artist and Brand Smith", "Brand identity, Figma, Illustration, Art direction",
                78, 4.8, 39, 44, "#8c1c1c",
                "I carve identities that read clearly at a distance and feel inevitable up close. Houses, guilds, and the occasional rebellion.");
        User mirelle = artisan("Mirelle Thorne", "mirellethorne", "The Scriptorium",
                "Keeper of the Long Scroll", "Copywriting, Lore, SEO, Editing",
                65, 4.9, 63, 71, "#5d6b4a",
                "Words are the oldest architecture. I write lore, landing pages, and scrolls that search engines can find without shame.");
        User kael = artisan("Kael Drayven", "kaeldrayven", "The Citadel",
                "Star-Reader of the Citadel", "Spring AI, RAG, Python, LLM evaluation",
                120, 5.0, 28, 31, "#6b5b8e",
                "I read patterns in the stars and in retrieval pipelines. Counsel systems that answer with sources, not swagger.");
        User ysra = artisan("Ysra of the Vale", "ysraofthevale", "The War Room",
                "Crier of the Vale", "Growth, Paid social, Email, Positioning",
                70, 4.7, 34, 38, "#b0602c",
                "I make sure the right people hear the horn. Campaigns, funnels, and launches that do not rely on luck.");
        User corvin = artisan("Corvin Blackquill", "corvinblackquill", "The Scriptorium",
                "Voice of the Raven", "Scriptwriting, Video, Narrative",
                58, 4.6, 22, 25, "#8a6d3b",
                "Scripts, trailers, and voices for the dark. I write for the ear first and the eye second.");
        User sable = artisan("Sable Renn", "sablerenn", "The Atelier",
                "Illuminator of Houses", "Illustration, Character art, Card art, Procreate",
                88, 4.9, 51, 57, "#a33b3b",
                "Portraits with weather in them. I paint houses, heroes, and the small betrayals around their eyes.");
        User torren = artisan("Torren Vey", "torrenvey", "The Exchequer",
                "Warden of Ledgers", "Financial modeling, Reconciliation, Stripe, SQL",
                110, 4.8, 19, 21, "#2f6b6b",
                "Coin leaves a trail. I follow it, reconcile it, and build ledgers that survive an audit and a siege.");
        User isolde = artisan("Isolde Marr", "isoldemarr", "The Citadel",
                "Keeper of the Data Wells", "Analytics, dbt, BigQuery, Dashboards",
                105, 4.8, 33, 36, "#2f4f6b",
                "I draw clean water from muddy data. Models, dashboards, and questions that actually matter.");
        User garrick = artisan("Garrick Fenn", "garrickfenn", "The Forge",
                "Bridgewright of Deployments", "DevOps, AWS, Terraform, Observability",
                115, 4.7, 41, 46, "#4a5568",
                "I build the bridges and watch the walls. Pipelines, infrastructure, and the quiet work of staying up.");
        User nyx = artisan("Nyx Ardent", "nyxardent", "The Atelier",
                "Ember Illustrator", "Digital painting, Concept art, Book covers",
                72, 4.9, 44, 49, "#7a3b6b",
                "Concept art with smoke in its lungs. Covers, creatures, and worlds that look lived in.");
        User elowen = artisan("Elowen Sable", "elowensable", "The War Room",
                "Keeper of the Campaign", "Campaign strategy, Content, Community",
                82, 4.6, 26, 29, "#4a6b3b",
                "Campaigns that gather a crowd and keep it. I plan the story, the channels, and the week after launch.");

        User bastian = patron("Lord Bastian Rook", "bastianrook", "bastian@emberhall.io",
                "Master of the Rookery", "The Citadel", "#2f4f6b",
                "The Rookery watches the northern pass. I fund work that makes the citadel harder to surprise.", 300);
        User seraphine = patron("Lady Seraphine Wynn", "seraphinewynn", "seraphine@emberhall.io",
                "Keeper of the Wynn Purse", "The Exchequer", "#2f6b6b",
                "The Wynn purse is old and patient. I commission ledgers, audits, and anything that makes coin honest.", 510);
        User edric = patron("Master Edric Hale", "edrichale", "edric@emberhall.io",
                "Warden of the Northern Road", "The War Room", "#8a6d3b",
                "The road must move. I hire builders, criers, and anyone who can keep a caravan on schedule.", 260);

        Job j1 = job(aeryn, "Build the Emberhall trading hall in React and Spring",
                """
                We are rebuilding the guild trading hall as a live marketplace. The work covers job listings, proposals, an escrow contract room, and a real time raven feed between patron and artisan.

                The backend is Spring Boot with PostgreSQL. The frontend is React with a strong visual identity. You will own the contract room end to end: funding, delivery, release, and the ledger view.

                The vault flow already has a sandbox PayPal integration. We need it hardened, tested, and made clear to a first time user. Expect close collaboration with our warden of ledgers.
                """,
                "The Forge", "React, Spring Boot, WebSocket, PostgreSQL", 4800, 6500, "FIXED", "6 weeks",
                Enums.JobStatus.IN_PROGRESS, true, 12);

        Job j2 = job(aeryn, "Design a house sigil system and brand tome",
                """
                The Ember Court needs a complete sigil system for six houses and one guild. Each mark must survive being carved, embroidered, and shrunk to a favicon.

                Deliver a brand tome with construction rules, clear space, color recipes, and three approved lockups per house. Include a small set of banner mockups and a one page usage sheet for artisans.

                We value restraint over ornament. The work should feel ancient but read cleanly on a screen.
                """,
                "The Atelier", "Brand identity, Figma, Illustration", 2200, 3400, "FIXED", "4 weeks",
                Enums.JobStatus.IN_PROGRESS, true, 9);

        Job j3 = job(aeryn, "Author the lore codex for a dark fantasy RPG",
                """
                We need a lore codex of roughly twelve thousand words for a dark fantasy tabletop setting. The tone is restrained, political, and cold. Think fewer dragons, more debts.

                The codex covers the fall of the old court, the six guild regions, three rival houses, and a timeline with enough gaps for players to fill.

                Include a style sheet, a glossary, and short in world excerpts that can be lifted into cards and menus.
                """,
                "The Scriptorium", "Lore, Copywriting, Worldbuilding", 1800, 2600, "FIXED", "5 weeks",
                Enums.JobStatus.COMPLETED, false, 45);

        Job j4 = job(aeryn, "Seal a PayPal escrow flow with sandbox keys",
                """
                Our escrow vault needs a clean PayPal sandbox integration. A patron funds a contract, the coin sits in escrow, and the artisan is paid when the work is delivered and approved.

                The current code creates orders and captures them, but the edge cases are thin: abandoned checkouts, duplicate captures, and a failed webhook.

                We need a short written runbook, tests for the failure paths, and a demo script the council can follow without an engineer at the table.
                """,
                "The Exchequer", "PayPal, Spring Boot, Payments", 1500, 2400, "FIXED", "2 weeks",
                Enums.JobStatus.OPEN, false, 7);

        Job j5 = job(bastian, "Integrate a RAG counsel bot on Spring AI",
                """
                The Rookery keeps a library of contracts, precedents, and field reports. We want a counsel bot that answers questions with citations to those documents.

                The stack is Spring Boot and Spring AI. You will build ingestion, chunking, retrieval, and a chat endpoint that refuses to answer when the sources are weak.

                Include an evaluation set of thirty questions and a short report on failure modes. We care more about honesty than fluency.
                """,
                "The Citadel", "Spring AI, RAG, Python, LLM evaluation", 3500, 5200, "FIXED", "5 weeks",
                Enums.JobStatus.COMPLETED, true, 38);

        Job j6 = job(bastian, "Launch campaign for a new guild marketplace",
                """
                We are opening a new hall and need a four week launch campaign. The audience is small studios and independent artisans who are tired of platforms that treat them as inventory.

                Deliver positioning, three email sequences, a paid social plan with a modest budget, and a launch week calendar. Copy must match our voice: plain, confident, and free of hype.

                We will judge the work on clarity and on whether a stranger can explain the hall after reading one page.
                """,
                "The War Room", "Growth, Paid social, Email", 2500, 4000, "FIXED", "3 weeks",
                Enums.JobStatus.COMPLETED, false, 34);

        Job j7 = job(seraphine, "Audit our escrow ledger and reconcile the vault",
                """
                The Wynn purse needs an independent audit of our escrow ledger. We suspect small rounding errors and at least one duplicate hold from an abandoned checkout.

                You will reconcile holds, releases, fees, and withdrawals against the contract table, then produce a short report with findings and a corrected ledger export.

                Discretion is required. The work is under a sealed oath and the data room opens only after the vault is funded.
                """,
                "The Exchequer", "Reconciliation, SQL, Financial modeling", 1500, 2400, "FIXED", "2 weeks",
                Enums.JobStatus.COMPLETED, false, 52);

        Job j8 = job(seraphine, "Craft a cinematic launch trailer",
                """
                We need a sixty second cinematic trailer for the opening of the new hall. The tone is cold, ceremonial, and confident. No shouting, no stock footage of handshakes.

                Deliver a script, a storyboard, a finished cut in 4K, and a vertical cut for the crier feeds. Music and sound design included.

                Reference the citadel artwork and the house sigils. The final frame should hold the hall name long enough to remember.
                """,
                "The Atelier", "Video, Motion, Sound", 3000, 5000, "FIXED", "4 weeks",
                Enums.JobStatus.COMPLETED, true, 61);

        Job j9 = job(edric, "Build a mobile companion for raven messages",
                """
                The northern road needs a mobile companion for the raven feed. Patrons and artisans should be able to read threads, receive push notices, and approve deliveries from a phone.

                The API already exists over WebSocket and REST. You will build the React Native client, offline caching, push notifications, and a clear sign in flow.

                The app must feel calm at night, readable with gloves on, and honest about connection state.
                """,
                "The Forge", "React Native, WebSocket, Push", 6000, 9000, "FIXED", "8 weeks",
                Enums.JobStatus.IN_PROGRESS, false, 28);

        Job j10 = job(edric, "Illustrate forty house portraits for the card game",
                """
                We need forty portraits for the card game, each a head and shoulders study with a distinct silhouette and house palette.

                The style is painterly, restrained, and readable at card size. No floating heads. Every portrait needs a background that says something about the house without stealing focus.

                Deliver layered source files, a contact sheet, and a short note on each character's visual logic.
                """,
                "The Atelier", "Character art, Procreate, Illustration", 4000, 7000, "FIXED", "6 weeks",
                Enums.JobStatus.COMPLETED, false, 70);

        Job j11 = job(aeryn, "SEO scrolls for the guild directory",
                """
                Our artisan directory needs to be found when patrons search for real skills. We need keyword research, rewritten category pages, and clean metadata.

                There are twelve category pages and sixty artisan profiles. Focus on the pages with commercial intent and fix the internal linking between regions and crafts.

                Deliver a prioritized backlog, the rewritten copy for the top twenty pages, and a simple monthly reporting sheet.
                """,
                "The Scriptorium", "SEO, Copywriting, Editing", 900, 1500, "FIXED", "2 weeks",
                Enums.JobStatus.COMPLETED, false, 25);

        Job j12 = job(bastian, "Set up observability for the citadel",
                """
                The citadel runs on a small Spring Boot estate and we are flying blind. We need traces, metrics, logs, and three alerts that actually matter.

                Use OpenTelemetry with a managed backend. Instrument the gateway, the vault service, and the raven feed. Keep the setup reproducible in Terraform.

                Deliver a dashboard for the council, a runbook for the night watch, and a short handover session.
                """,
                "The Citadel", "Observability, AWS, Terraform", 2800, 4200, "FIXED", "3 weeks",
                Enums.JobStatus.COMPLETED, false, 48);

        Job j13 = job(seraphine, "Migrate the vault from H2 to PostgreSQL",
                """
                Our ledger currently runs on a file based database. It has served us well in the hall, but the vault needs proper backups, concurrent writers, and a real migration path.

                You will move the schema to PostgreSQL, add Flyway migrations, and prove the migration with a rehearsal on a copy of production data.

                Include a rollback plan and a short note on connection pooling and backup schedule.
                """,
                "The Forge", "PostgreSQL, Spring Boot, Flyway", 1800, 3000, "FIXED", "2 weeks",
                Enums.JobStatus.IN_PROGRESS, false, 6);

        Job j14 = job(edric, "Compose the guild anthem and sound sigils",
                """
                We need a short anthem for ceremonies and a family of sound sigils for the product: vault sealed, work delivered, oath fulfilled, raven received.

                The anthem should be thirty to forty five seconds, recorded with real instruments if possible, and work as a loop under a trailer.

                Deliver stems, a mastered mix, and a one page note on how each sigil should be used.
                """,
                "The Atelier", "Music, Sound design", 1200, 2000, "FIXED", "3 weeks",
                Enums.JobStatus.OPEN, false, 4);

        Job j15 = job(aeryn, "Negotiate payment rails with the Iron Bank",
                """
                We are exploring a second payment rail beyond PayPal. The work is part research, part negotiation, and part written counsel.

                Map the options for a marketplace with escrow, compare fees and settlement times, and draft the questions we should put to each provider.

                Deliver a decision memo, a comparison table, and a recommended path with risks stated plainly.
                """,
                "The Exchequer", "Payments, Negotiation, Compliance", 2000, 3500, "HOURLY", "4 weeks",
                Enums.JobStatus.OPEN, false, 3);

        Job j16 = job(aeryn, "Build a Spring Boot API for the guild ledger",
                """
                The ledger service needs a clean REST API with contracts, holds, releases, and a read model for the treasury page.

                We need idempotent writes, clear error codes, and tests that cover the awkward paths: double release, partial capture, and a patron who abandons checkout.

                The existing code is a good start but the edges are soft. We want a builder who leaves the wall stronger than they found it.
                """,
                "The Forge", "Java, Spring Boot, PostgreSQL", 3500, 5000, "FIXED", "4 weeks",
                Enums.JobStatus.OPEN, true, 2);

        Job j17 = job(bastian, "Wire a Redis presence layer for the raven feed",
                """
                We need reliable presence for the raven feed: who is online, who is typing, and who has gone quiet.

                The current implementation is in memory and breaks when we run more than one instance. Move it to Redis with a sensible expiry, a heartbeat, and a clean fallback when Redis is unavailable.

                Include load notes and a short demo with two browser sessions.
                """,
                "The Forge", "Redis, WebSocket, Spring Boot", 1800, 2800, "FIXED", "2 weeks",
                Enums.JobStatus.OPEN, false, 1);

        Job j18 = job(bastian, "Rebuild the guild vault interface",
                """
                The vault page needs a clearer story: what is held, what is released, and what is owed. The current screen is a table with no hierarchy.

                Rebuild the interface with a summary, a contract list, and a detail drawer. Keep the dark ceremonial look but make the numbers legible.
                """,
                "The Forge", "React, TypeScript, Design systems", 3200, 4200, "FIXED", "3 weeks",
                Enums.JobStatus.COMPLETED, false, 90);

        Job j19 = job(edric, "Ship the raven feed real time layer",
                """
                The raven feed needs to feel instant. Build the WebSocket layer, reconnect logic, and presence for a two party thread.

                The API already has REST history. Add the live channel, optimistic sends, and a clear indicator when the connection drops.
                """,
                "The Forge", "WebSocket, React, Spring Boot", 2400, 3400, "FIXED", "3 weeks",
                Enums.JobStatus.COMPLETED, false, 85);

        Proposal p1 = proposal(j1, aelira,
                """
                I have built three escrow systems and one trading hall. Your flow is close: the missing piece is a state machine that refuses impossible moves and a ledger that explains every coin.

                I will start with the contract room, then harden the PayPal capture path, then make the vault legible to a first time patron. Two checkpoints a week, staging always live.

                My bid covers the full scope, tests for the failure paths, and a short runbook for your warden.
                """, 5200, 42, Enums.ProposalStatus.ACCEPTED, false, 12);
        Proposal p2 = proposal(j2, rowan,
                """
                Sigils should survive the carving. I will build each mark from a simple geometric spine, then add one distinctive break that survives at 24 pixels.

                You will receive three lockups per house, a construction grid, color recipes for screen and thread, and a usage sheet that a printer can follow without calling me.

                I can send the first two houses in five days for the council to judge.
                """, 2800, 24, Enums.ProposalStatus.ACCEPTED, false, 8);
        proposal(j2, sable, """
                I paint houses for a living. My approach would start with the animal and the weather, then reduce both to a mark that reads on a banner and a button.

                I can deliver the six houses plus the guild mark, with layered source files and a short rationale for each.
                """, 3100, 28, Enums.ProposalStatus.PENDING, true, 7);
        proposal(j2, nyx, """
                I would treat this as a heraldry commission, not a logo exercise. Each sigil gets a silhouette test at small size before any ornament is added.

                My bid includes a full brand tome and one round of council revisions.
                """, 2600, 21, Enums.ProposalStatus.PENDING, false, 6);
        Proposal p3 = proposal(j3, mirelle,
                """
                I have written three setting bibles and one very stubborn glossary. Your world needs fewer explanations and more evidence: debts, letters, and the things people refuse to say.

                I will deliver twelve thousand words, a timeline with deliberate gaps, and a style sheet your card team can follow.
                """, 2200, 35, Enums.ProposalStatus.ACCEPTED, false, 44);
        proposal(j3, corvin, """
                I write for the ear, which makes for lore that sounds true when read aloud. I would build the codex around three voices: the court, the road, and the heretic.

                Twelve thousand words, plus six short excerpts for cards.
                """, 1900, 30, Enums.ProposalStatus.DECLINED, false, 43);
        proposal(j4, torren, """
                I reconcile vaults for a living. I will trace every hold, capture, release, and fee, then write the runbook your council can actually follow.

                I can start with the failure paths: abandoned checkout, duplicate capture, and the webhook that never arrives.
                """, 1800, 12, Enums.ProposalStatus.PENDING, false, 5);
        Proposal p4 = proposal(j5, kael,
                """
                I build counsel systems that cite their sources or keep quiet. Your library is the real asset; the model is only a reader.

                I will deliver ingestion, retrieval with reranking, a grounded chat endpoint, and an evaluation set of thirty questions. The report will name the failure modes without flattery.
                """, 4600, 32, Enums.ProposalStatus.ACCEPTED, false, 37);
        Proposal p5 = proposal(j6, ysra,
                """
                You do not need a louder launch. You need a clearer promise. I will write the positioning first, then build the campaign around one sentence a stranger can repeat.

                Four weeks, three email sequences, a paid plan with a modest budget, and a launch calendar your team can run without me.
                """, 3200, 21, Enums.ProposalStatus.ACCEPTED, false, 33);
        Proposal p6 = proposal(j7, torren,
                """
                I will reconcile the vault line by line and show my work. Rounding errors hide in fees, and duplicate holds hide in abandoned checkouts.

                You will receive a findings report, a corrected export, and a short list of controls to stop the next one.
                """, 2100, 14, Enums.ProposalStatus.ACCEPTED, false, 51);
        Proposal p7 = proposal(j8, corvin,
                """
                Sixty seconds is a long time if the story is thin. I would build the trailer around one image: the vault door closing on a promise.

                Script, storyboard, 4K cut, vertical cut, music, and sound. I can send the first animatic in nine days.
                """, 4200, 26, Enums.ProposalStatus.ACCEPTED, false, 60);
        Proposal p8 = proposal(j9, garrick,
                """
                The mobile companion should feel like a quiet instrument, not a feed. I will build the React Native client with offline history, push notices, and an honest connection indicator.

                I have shipped four WebSocket clients and I know where the reconnection bugs live.
                """, 7200, 50, Enums.ProposalStatus.ACCEPTED, false, 27);
        Proposal p9 = proposal(j10, sable,
                """
                Forty portraits is a marathon. I would lock the silhouette language in the first five, then move in batches of ten with a contact sheet review at each gate.

                Layered files, a contact sheet, and a short note on each character's visual logic.
                """, 5600, 40, Enums.ProposalStatus.ACCEPTED, false, 69);
        Proposal p10 = proposal(j11, mirelle,
                """
                Your directory has good pages buried under vague titles. I will fix the twenty pages with commercial intent first, then wire the internal links between region and craft.

                You will receive a prioritized backlog and a reporting sheet a non specialist can read.
                """, 1200, 12, Enums.ProposalStatus.ACCEPTED, false, 24);
        Proposal p11 = proposal(j12, garrick,
                """
                You do not need more dashboards. You need three alerts that wake the right person and a trace that explains the bad night.

                I will instrument the gateway, vault, and raven feed with OpenTelemetry, keep it reproducible in Terraform, and hand over a runbook.
                """, 3600, 20, Enums.ProposalStatus.ACCEPTED, false, 47);
        Proposal p12 = proposal(j13, aelira,
                """
                A file based ledger is a single candle in a stone room. I will move the schema to PostgreSQL with Flyway, rehearse the migration on a copy, and leave you a rollback that works.

                The bid includes the rehearsal, the backup schedule, and a short handover with your night watch.
                """, 2600, 14, Enums.ProposalStatus.ACCEPTED, false, 5);
        proposal(j14, elowen, """
                I would build the anthem from a low string figure and one horn call, then reduce the same motif into four short sigils.

                Real players where possible, stems and a mastered mix included.
                """, 1600, 18, Enums.ProposalStatus.PENDING, false, 3);
        proposal(j15, torren, """
                I have negotiated two payment rails and walked away from one. I will map the options, compare the true cost of settlement, and draft the questions that expose the weak points.

                You will get a decision memo with a recommendation and the risks stated plainly.
                """, 2800, 20, Enums.ProposalStatus.PENDING, false, 2);
        proposal(j16, aelira, """
                I would start with the state machine, because most ledger bugs are impossible moves that the API allowed.

                Then idempotent writes, clear error codes, and tests for double release and partial capture. Your wall will be stronger when I leave.
                """, 4200, 24, Enums.ProposalStatus.PENDING, true, 2);
        proposal(j16, garrick, """
                I have hardened three payment APIs. The work is mostly in the edges: retries, timeouts, and a capture that arrives twice.

                I can deliver the API, the tests, and a short note on the invariants that must never break.
                """, 4600, 26, Enums.ProposalStatus.PENDING, false, 1);
        proposal(j17, aelira, """
                Presence is a small problem with sharp edges. I will move the heartbeat to Redis with a 75 second window, keep the in memory fallback, and prove it with two browser sessions.

                You will get load notes and a demo your council can repeat.
                """, 2400, 10, Enums.ProposalStatus.PENDING, false, 1);

        Contract c1 = contract(j1, aeryn, aelira, "EH-2026-0101", 5200,
                Enums.ContractStatus.DELIVERED, Enums.Gateway.PAYPAL, 12, 12, 1, null, 4,
                "The trading floor, contract room, and vault view are staged. The PayPal capture path now refuses duplicate captures. Runbook and demo script are in the delivery folder.",
                "https://staging.emberhall.example/contract-room");
        Contract c2 = contract(j2, aeryn, rowan, "EH-2026-0102", 2800,
                Enums.ContractStatus.IN_PROGRESS, Enums.Gateway.PAYPAL, 5, 5, null, null, 9,
                null, null);
        Contract c3 = contract(j5, bastian, kael, "EH-2026-0103", 4600,
                Enums.ContractStatus.RELEASED, Enums.Gateway.PAYPAL, 32, 32, 20, 18, null,
                "Retrieval pipeline, grounded chat endpoint, evaluation set, and failure report delivered.",
                "https://rookery.example/counsel");
        Contract c4 = contract(j8, seraphine, corvin, "EH-2026-0104", 4200,
                Enums.ContractStatus.RELEASED, Enums.Gateway.PAYPAL, 55, 55, 30, 28, null,
                "Sixty second cut, vertical cut, stems, and sound sigils delivered.",
                "https://wynn.example/trailer");
        Contract c5 = contract(j10, edric, sable, "EH-2026-0105", 5600,
                Enums.ContractStatus.RELEASED, Enums.Gateway.CROWN, 64, 64, 40, 38, null,
                "Forty portraits, contact sheet, and visual logic notes delivered.",
                "https://northroad.example/portraits");
        Contract c6 = contract(j7, seraphine, torren, "EH-2026-0106", 2100,
                Enums.ContractStatus.RELEASED, Enums.Gateway.PAYPAL, 46, 46, 32, 30, null,
                "Findings report, corrected ledger export, and control recommendations delivered.",
                "https://wynn.example/audit");
        Contract c7 = contract(j12, bastian, garrick, "EH-2026-0107", 3600,
                Enums.ContractStatus.RELEASED, Enums.Gateway.PAYPAL, 42, 42, 26, 24, null,
                "OpenTelemetry instrumentation, Terraform, council dashboard, and night watch runbook delivered.",
                "https://rookery.example/observability");
        Contract c8 = contract(j6, bastian, ysra, "EH-2026-0108", 3200,
                Enums.ContractStatus.RELEASED, Enums.Gateway.CROWN, 30, 30, 18, 16, null,
                "Positioning, three email sequences, paid plan, and launch calendar delivered.",
                "https://rookery.example/launch");
        Contract c9 = contract(j11, aeryn, mirelle, "EH-2026-0109", 1200,
                Enums.ContractStatus.RELEASED, Enums.Gateway.PAYPAL, 21, 21, 12, 10, null,
                "Keyword map, twenty rewritten pages, internal linking plan, and reporting sheet delivered.",
                "https://emberhall.example/seo");
        Contract c10 = contract(j13, seraphine, aelira, "EH-2026-0110", 2600,
                Enums.ContractStatus.AWAITING_FUNDING, null, 2, null, null, null, 14,
                null, null);
        Contract c11 = contract(j9, edric, garrick, "EH-2026-0111", 7200,
                Enums.ContractStatus.FUNDED, Enums.Gateway.PAYPAL, 20, 20, null, null, 30,
                null, null);
        Contract c12 = contract(j3, aeryn, mirelle, "EH-2026-0112", 2200,
                Enums.ContractStatus.RELEASED, Enums.Gateway.PAYPAL, 40, 40, 18, 15, null,
                "Twelve thousand word codex, style sheet, glossary, and six card excerpts delivered.",
                "https://emberhall.example/codex");
        Contract c13 = contract(j18, bastian, aelira, "EH-2026-0113", 3800,
                Enums.ContractStatus.RELEASED, Enums.Gateway.PAYPAL, 88, 88, 60, 58, null,
                "Vault summary, contract list, detail drawer, and ledger read model delivered.",
                "https://rookery.example/vault-ui");
        Contract c14 = contract(j19, edric, aelira, "EH-2026-0114", 2900,
                Enums.ContractStatus.RELEASED, Enums.Gateway.CROWN, 82, 82, 55, 53, null,
                "Live WebSocket channel, reconnect logic, presence, and optimistic sends delivered.",
                "https://northroad.example/ravens");

        Conversation conv1 = conversation(c1, aeryn, aelira, j1.getTitle(), 12);
        message(conv1, aeryn, "The oath is sworn. The vault is sealed, so build with a free hand.", false, 1500);
        message(conv1, aelira, "The trading floor and the raven feed are standing. I am polishing the vault ledger view tonight.", false, 1440);
        message(conv1, aeryn, "Send the staging link when the seal is ready. I will inspect with the council.", false, 1380);
        message(conv1, aelira, "Staging is live. The vault view now shows held and released coin. Notes are in the delivery panel.", false, 240);
        message(conv1, aelira, "I have delivered the work. The runbook covers the PayPal edge cases we discussed.", false, 90);

        Conversation conv2 = conversation(c2, aeryn, rowan, j2.getTitle(), 5);
        message(conv2, aeryn, "The council wants the sigils to feel carved, not printed.", false, 600);
        message(conv2, rowan, "Then I will work in deep relief with a single ember accent. First pass of three houses arrives tomorrow.", false, 540);
        message(conv2, aeryn, "Good. Keep the wolf and the raven distinct at small sizes.", false, 480);
        message(conv2, rowan, "Noted. I will send a 24 pixel test sheet with the first pass.", false, 120);

        Conversation conv3 = conversation(c3, bastian, kael, j5.getTitle(), 32);
        message(conv3, bastian, "The library is open. Start with the contract precedents, they carry the most weight.", false, 3000);
        message(conv3, kael, "The first evaluation pass is honest: strong retrieval, weak answers when two precedents conflict.", false, 2880);
        message(conv3, bastian, "That is the exact failure I wanted named. Continue.", false, 2820);
        message(conv3, kael, "Delivered. The report lists the conflicts and the questions the bot should refuse.", false, 2200);

        Conversation conv4 = conversation(c4, seraphine, corvin, j8.getTitle(), 55);
        message(conv4, seraphine, "The first cut is close. The vault door needs one more beat before it closes.", false, 2400);
        message(conv4, corvin, "Agreed. I will hold the silence two frames longer and let the horn land after.", false, 2360);
        message(conv4, corvin, "Final cut delivered, with the vertical and the sound sigils.", false, 2100);

        Conversation conv5 = conversation(c5, edric, sable, j10.getTitle(), 64);
        message(conv5, edric, "The northern houses need to look cold, not cruel.", false, 4000);
        message(conv5, sable, "Cold is a color problem. I will pull the reds back and let the eyes carry the warmth.", false, 3960);
        message(conv5, sable, "All forty delivered. The contact sheet is ordered by house.", false, 3900);

        Conversation conv6 = conversation(c6, seraphine, torren, j7.getTitle(), 46);
        message(conv6, seraphine, "Start with the duplicate hold. I want to know how it survived the first audit.", false, 3600);
        message(conv6, torren, "Found it. An abandoned checkout retried after the hold was written. The report shows the exact path.", false, 3500);
        message(conv6, torren, "Corrected export and controls delivered.", false, 3400);

        Conversation conv7 = conversation(c7, bastian, garrick, j12.getTitle(), 42);
        message(conv7, bastian, "Three alerts. No more.", false, 3200);
        message(conv7, garrick, "Vault latency, capture failures, and raven backlog. The rest is noise until proven otherwise.", false, 3160);
        message(conv7, garrick, "Instrumentation and runbook delivered.", false, 3000);

        Conversation conv8 = conversation(c8, bastian, ysra, j6.getTitle(), 30);
        message(conv8, bastian, "Give me the one sentence a stranger can repeat.", false, 2600);
        message(conv8, ysra, "A guild hall where the coin is sealed before the work begins.", false, 2560);
        message(conv8, ysra, "Campaign delivered. The launch calendar is ready for your criers.", false, 2400);

        Conversation conv9 = conversation(c9, aeryn, mirelle, j11.getTitle(), 21);
        message(conv9, aeryn, "The directory is invisible in search. Fix the pages that can actually earn.", false, 1800);
        message(conv9, mirelle, "Twenty pages rewritten. The internal links now move authority from the region pages to the crafts.", false, 1700);
        message(conv9, mirelle, "Backlog and reporting sheet delivered.", false, 1600);

        Conversation conv10 = conversation(c10, seraphine, aelira, j13.getTitle(), 2);
        message(conv10, seraphine, "The purse is being moved from the Exchequer. Expect the seal within two days.", false, 300);
        message(conv10, aelira, "I will hold the first block of days. Send word when the vault is sealed.", false, 240);

        Conversation conv11 = conversation(c11, edric, garrick, j9.getTitle(), 20);
        message(conv11, edric, "The road is long and the signal is poor. Offline history matters more than polish.", false, 2000);
        message(conv11, garrick, "Understood. I am testing the reconnect path on a throttled connection this week.", false, 1900);

        Conversation conv12 = conversation(c12, aeryn, mirelle, j3.getTitle(), 40);
        message(conv12, aeryn, "The codex needs more debts and fewer prophecies.", false, 3200);
        message(conv12, mirelle, "Then the timeline will be built from unpaid promises. The gaps will do the rest.", false, 3100);

        Conversation conv13 = conversation(c13, bastian, aelira, j18.getTitle(), 88);
        message(conv13, bastian, "The vault page is a table with no story. Give the numbers a hierarchy.", false, 5000);
        message(conv13, aelira, "Held, released, and owed will each get a clear line. The detail drawer will carry the evidence.", false, 4900);

        Conversation conv14 = conversation(c14, edric, aelira, j19.getTitle(), 82);
        message(conv14, edric, "The raven feed feels slow when the road is bad. Fix the reconnect.", false, 4800);
        message(conv14, aelira, "Reconnect now backs off and replays the last message. Presence expires after 75 seconds.", false, 4700);

        review(c3, 5, "Kael named the failure modes instead of hiding them. The counsel bot now refuses to answer when the sources are weak, which is exactly what we asked for.", 17);
        review(c4, 5, "The trailer lands. Corvin understood that the silence before the vault closes was the whole film.", 27);
        review(c5, 5, "Forty portraits, every one distinct. The contact sheet alone was worth the fee.", 37);
        review(c6, 4, "Thorough and discreet. The report found a duplicate hold we had missed twice.", 29);
        review(c7, 5, "Three alerts, all useful. The night watch finally has a runbook it can follow.", 23);
        review(c8, 5, "Ysra found the one sentence. The campaign has a spine now.", 15);
        review(c9, 5, "The directory finally reads like a place, not a list. Traffic is up and the copy is clean.", 9);
        review(c12, 5, "Mirelle writes lore that sounds like it was found, not invented. The codex is the best asset we own.", 14);
        review(c13, 5, "Aelira turned a table into a story. The vault page is now the clearest screen in the hall.", 57);
        review(c14, 5, "The raven feed feels instant, even on the northern road. Reconnection is invisible, which is the point.", 52);

        ledger(aeryn, c1, Enums.LedgerType.ESCROW_HOLD, new BigDecimal("5720.00"), "Vault sealed for EH-2026-0101", 12);
        ledger(aeryn, c2, Enums.LedgerType.ESCROW_HOLD, new BigDecimal("3080.00"), "Vault sealed for EH-2026-0102", 5);
        ledger(aeryn, c9, Enums.LedgerType.ESCROW_HOLD, new BigDecimal("1320.00"), "Vault sealed for EH-2026-0109", 21);
        ledger(aeryn, c9, Enums.LedgerType.PLATFORM_FEE, new BigDecimal("120.00"), "Guild tithe for EH-2026-0109", 10);
        ledger(aelira, c13, Enums.LedgerType.ESCROW_RELEASE, new BigDecimal("3800.00"), "Escrow released for EH-2026-0113", 58);
        ledger(aelira, c14, Enums.LedgerType.ESCROW_RELEASE, new BigDecimal("2900.00"), "Escrow released for EH-2026-0114", 53);
        ledger(aelira, null, Enums.LedgerType.WITHDRAWAL, new BigDecimal("1500.00"), "Withdrawal to the Iron Bank", 30);
        ledger(aelira, null, Enums.LedgerType.DEPOSIT, new BigDecimal("2000.00"), "Deposit from a private commission", 20);
        ledger(kael, c3, Enums.LedgerType.ESCROW_RELEASE, new BigDecimal("4600.00"), "Escrow released for EH-2026-0103", 18);
        ledger(torren, c6, Enums.LedgerType.ESCROW_RELEASE, new BigDecimal("2100.00"), "Escrow released for EH-2026-0106", 30);
        ledger(garrick, c7, Enums.LedgerType.ESCROW_RELEASE, new BigDecimal("3600.00"), "Escrow released for EH-2026-0107", 24);

        notify(aeryn, "Work is delivered", "Aelira Voss has delivered the trading hall. Inspect it and break the seal.", Enums.NotificationType.CONTRACT, "/contracts/" + c1.getId(), false, 2);
        notify(aeryn, "A new proposal arrives", "Nyx Ardent has sworn a proposal for the sigil system.", Enums.NotificationType.PROPOSAL, "/jobs/" + j2.getId(), false, 5);
        notify(aeryn, "The oath is fulfilled", "Your contract with Mirelle Thorne for the lore codex is sealed and complete.", Enums.NotificationType.CONTRACT, "/contracts/" + c12.getId(), true, 26);
        notify(aeryn, "A raven from Aelira", "The vault view now shows held and released coin.", Enums.NotificationType.MESSAGE, "/messages", true, 3);
        notify(aelira, "Your oath is accepted", "Lady Seraphine Wynn accepted your proposal for the PostgreSQL migration. The vault awaits its seal.", Enums.NotificationType.CONTRACT, "/contracts/" + c10.getId(), false, 4);
        notify(aelira, "A new decree matches your craft", "Build a Spring Boot API for the guild ledger. The purse is 3500 to 5000.", Enums.NotificationType.SYSTEM, "/jobs/" + j16.getId(), false, 8);
        notify(aelira, "The vault is opened", "3800.00 USD was released to your purse for EH-2026-0113.", Enums.NotificationType.PAYMENT, "/treasury", true, 58);
        notify(aelira, "A raven from Aeryn", "Send the staging link when the seal is ready. I will inspect with the council.", Enums.NotificationType.MESSAGE, "/messages", true, 20);

        jobs.findAll().forEach(j -> {
            j.setProposalsCount(proposals.findByJobIdOrderByCreatedAtDesc(j.getId()).size());
            jobs.save(j);
        });
    }

    private User artisan(String name, String handle, String region, String title, String skills,
                         double rate, double rating, int reviewsCount, int completed, String color, String bio) {
        return user(name, handle, handle + "@emberhall.io", Enums.Role.ARTISAN, title, region, skills,
                rate, rating, reviewsCount, completed,
                new BigDecimal(completed * 180), true, color, bio, region, 300 + reviewsCount);
    }

    private User patron(String name, String handle, String email, String title, String region,
                        String color, String bio, int daysAgo) {
        return user(name, handle, email, Enums.Role.PATRON, title, region, "", 0, 0, 0, 4,
                BigDecimal.ZERO, true, color, bio, region, daysAgo);
    }

    private User user(String name, String handle, String email, Enums.Role role, String title,
                      String region, String skills, double rate, double rating, int reviewsCount,
                      int completed, BigDecimal balance, boolean verified, String color, String bio,
                      String location, int daysAgo) {
        User u = new User();
        u.setName(name);
        u.setHandle(handle);
        u.setEmail(email);
        u.setPasswordHash(encoder.encode("guildhall"));
        u.setRole(role);
        u.setTitle(title);
        u.setRegion(region);
        u.setSkills(skills);
        u.setHourlyRate(BigDecimal.valueOf(rate));
        u.setRating(rating);
        u.setReviewsCount(reviewsCount);
        u.setCompletedContracts(completed);
        u.setBalance(balance);
        u.setVerified(verified);
        u.setAvatarColor(color);
        u.setBio(bio);
        u.setLocation(location);
        u.setJoinedAt(Instant.now().minus(daysAgo, ChronoUnit.DAYS));
        u.setLastSeenAt(Instant.now().minus(daysAgo / 3, ChronoUnit.HOURS));
        return users.save(u);
    }

    private Job job(User patron, String title, String description, String region, String skills,
                    double min, double max, String type, String duration, Enums.JobStatus status,
                    boolean featured, int daysAgo) {
        Job j = new Job();
        j.setPatron(patron);
        j.setTitle(title);
        j.setDescription(description.trim());
        j.setRegion(region);
        j.setSkills(skills);
        j.setBudgetMin(BigDecimal.valueOf(min));
        j.setBudgetMax(BigDecimal.valueOf(max));
        j.setBudgetType(type);
        j.setDuration(duration);
        j.setStatus(status);
        j.setFeatured(featured);
        j.setCreatedAt(Instant.now().minus(daysAgo, ChronoUnit.DAYS));
        j.setDeadline(Instant.now().plus(30 - Math.min(daysAgo, 25), ChronoUnit.DAYS));
        return jobs.save(j);
    }

    private Proposal proposal(Job job, User artisan, String letter, double amount, int days,
                              Enums.ProposalStatus status, boolean aiDrafted, int daysAgo) {
        Proposal p = new Proposal();
        p.setJob(job);
        p.setArtisan(artisan);
        p.setCoverLetter(letter.trim());
        p.setBidAmount(BigDecimal.valueOf(amount));
        p.setDays(days);
        p.setStatus(status);
        p.setAiDrafted(aiDrafted);
        p.setCreatedAt(Instant.now().minus(daysAgo, ChronoUnit.DAYS));
        return proposals.save(p);
    }

    private Contract contract(Job job, User patron, User artisan, String reference, double amount,
                              Enums.ContractStatus status, Enums.Gateway gateway, int createdDaysAgo,
                              Integer fundedDaysAgo, Integer deliveredDaysAgo, Integer releasedDaysAgo,
                              Integer dueInDays, String deliverableNote, String deliverableUrl) {
        BigDecimal value = BigDecimal.valueOf(amount);
        BigDecimal fee = value.multiply(new BigDecimal("0.10")).setScale(2);
        Contract c = new Contract();
        c.setReference(reference);
        c.setJob(job);
        c.setPatron(patron);
        c.setArtisan(artisan);
        c.setAmount(value);
        c.setFee(fee);
        c.setTotal(value.add(fee));
        c.setStatus(status);
        c.setGateway(gateway);
        c.setCreatedAt(Instant.now().minus(createdDaysAgo, ChronoUnit.DAYS));
        if (fundedDaysAgo != null) {
            c.setFundedAt(Instant.now().minus(fundedDaysAgo, ChronoUnit.DAYS));
        }
        if (deliveredDaysAgo != null) {
            c.setDeliveredAt(Instant.now().minus(deliveredDaysAgo, ChronoUnit.DAYS));
        }
        if (releasedDaysAgo != null) {
            c.setReleasedAt(Instant.now().minus(releasedDaysAgo, ChronoUnit.DAYS));
        }
        if (dueInDays != null) {
            c.setDueAt(Instant.now().plus(dueInDays, ChronoUnit.DAYS));
        }
        c.setDeliverableNote(deliverableNote);
        c.setDeliverableUrl(deliverableUrl);
        if (gateway != null) {
            c.setPaypalOrderId("PAYPAL-" + reference);
            c.setPaypalCaptureId("CAPTURE-" + reference);
        }
        return contracts.save(c);
    }

    private Conversation conversation(Contract contract, User patron, User artisan, String subject, int daysAgo) {
        Conversation c = new Conversation();
        c.setContract(contract);
        c.setPatron(patron);
        c.setArtisan(artisan);
        c.setSubject(subject);
        c.setCreatedAt(Instant.now().minus(daysAgo, ChronoUnit.DAYS));
        c.setLastMessageAt(Instant.now().minus(Math.max(daysAgo - 1, 0), ChronoUnit.DAYS));
        Conversation saved = conversations.save(c);
        Message system = new Message();
        system.setConversation(saved);
        system.setSender(patron);
        system.setBody("The oath is sworn. The vault must be sealed before the work begins.");
        system.setSystem(true);
        system.setCreatedAt(Instant.now().minus(daysAgo, ChronoUnit.DAYS));
        messages.save(system);
        return saved;
    }

    private void message(Conversation conversation, User sender, String body, boolean system, int minutesAgo) {
        Message m = new Message();
        m.setConversation(conversation);
        m.setSender(sender);
        m.setBody(body);
        m.setSystem(system);
        m.setCreatedAt(Instant.now().minus(minutesAgo, ChronoUnit.MINUTES));
        messages.save(m);
        conversation.setLastMessageAt(m.getCreatedAt());
        conversations.save(conversation);
    }

    private void review(Contract contract, int rating, String comment, int daysAgo) {
        Review r = new Review();
        r.setContract(contract);
        r.setPatron(contract.getPatron());
        r.setArtisan(contract.getArtisan());
        r.setRating(rating);
        r.setComment(comment);
        r.setCreatedAt(Instant.now().minus(daysAgo, ChronoUnit.DAYS));
        reviews.save(r);
    }

    private void ledger(User user, Contract contract, Enums.LedgerType type, BigDecimal amount,
                        String description, int daysAgo) {
        LedgerEntry e = new LedgerEntry();
        e.setUser(user);
        e.setContract(contract);
        e.setType(type);
        e.setAmount(amount);
        e.setDescription(description);
        e.setCreatedAt(Instant.now().minus(daysAgo, ChronoUnit.DAYS));
        ledger.save(e);
    }

    private void notify(User user, String title, String body, Enums.NotificationType type,
                        String link, boolean read, int hoursAgo) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setBody(body);
        n.setType(type);
        n.setLink(link);
        n.setRead(read);
        n.setCreatedAt(Instant.now().minus(hoursAgo, ChronoUnit.HOURS));
        notifications.save(n);
    }
}
