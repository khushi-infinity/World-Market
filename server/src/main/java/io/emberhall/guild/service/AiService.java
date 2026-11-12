package io.emberhall.guild.service;

import io.emberhall.guild.domain.Job;
import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.repo.JobRepository;
import io.emberhall.guild.web.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private static final String SYSTEM = """
            You are the Oracle of Emberhall, counsel to a guild of patrons and artisans.
            You advise on freelance contracts, scoping, pricing, proposals, delivery and disputes.
            Speak with quiet authority and a touch of old-world flavor, but stay concrete and practical.
            Rules: never use em dashes or en dashes. Keep answers under 220 words unless drafting a document.
            Use short paragraphs or tight bullets. Never invent legal terms. Never promise outcomes.
            """;

    private final ChatClient chatClient;
    private final JobRepository jobs;
    private final String apiKey;
    private final String model;

    public AiService(ChatClient.Builder builder, JobRepository jobs,
                     @Value("${spring.ai.openai.api-key:not-configured}") String apiKey,
                     @Value("${spring.ai.openai.chat.model:llama-3.3-70b-versatile}") String model) {
        this.chatClient = builder.build();
        this.jobs = jobs;
        this.apiKey = apiKey;
        this.model = model;
    }

    public boolean isLive() {
        return apiKey != null && !apiKey.isBlank()
                && !apiKey.equalsIgnoreCase("not-configured")
                && !apiKey.startsWith("your-");
    }

    public AiResponse counsel(AiRequest req) {
        String prompt = req.prompt() == null ? "" : req.prompt().trim();
        if (prompt.isBlank()) {
            throw ApiException.badRequest("The Oracle waits for a question.");
        }
        String context = req.context() == null ? "" : req.context().trim();
        if (isLive()) {
            try {
                String text = chatClient.prompt()
                        .system(SYSTEM)
                        .user(u -> u.text("""
                                Question: {question}
                                Context supplied by the supplicant: {context}
                                """).param("question", prompt).param("context", context.isBlank() ? "none" : context))
                        .call()
                        .content();
                return new AiResponse(clean(text), true, model);
            } catch (Exception ex) {
                log.warn("Oracle live call failed, falling back: {}", ex.getMessage());
            }
        }
        return new AiResponse(clean(fallbackCounsel(prompt, context)), false, "emberhall-oracle");
    }

    public AiResponse draftProposal(ProposalAiRequest req) {
        Job job = req.jobId() == null ? null : jobs.findById(req.jobId()).orElse(null);
        String tone = req.tone() == null || req.tone().isBlank() ? "measured and confident" : req.tone();
        String highlights = req.highlights() == null ? "" : req.highlights().trim();
        String jobTitle = job == null ? "the posted decree" : job.getTitle();
        String skills = job == null ? "" : job.getSkills();
        String budget = job == null ? "" : job.getBudgetMin() + " to " + job.getBudgetMax();

        if (isLive()) {
            try {
                String text = chatClient.prompt()
                        .system(SYSTEM + "\nDraft a proposal of 120 to 170 words. No placeholders like [Name]. "
                                + "Write in first person. End with a clear next step.")
                        .user(u -> u.text("""
                                Decree: {title}
                                Skills sought: {skills}
                                Purse: {budget}
                                Tone: {tone}
                                Artisan highlights: {highlights}
                                """).param("title", jobTitle).param("skills", skills)
                                .param("budget", budget).param("tone", tone)
                                .param("highlights", highlights.isBlank() ? "none supplied" : highlights))
                        .call()
                        .content();
                return new AiResponse(clean(text), true, model);
            } catch (Exception ex) {
                log.warn("Oracle proposal draft failed, falling back: {}", ex.getMessage());
            }
        }
        return new AiResponse(clean(fallbackProposal(jobTitle, skills, budget, tone, highlights)), false, "emberhall-oracle");
    }

    public AiResponse draftBrief(BriefAiRequest req) {
        String title = req.title() == null ? "" : req.title().trim();
        String notes = req.notes() == null ? "" : req.notes().trim();
        String region = req.region() == null ? "the hall" : req.region();
        if (title.isBlank()) {
            throw ApiException.badRequest("Give the Oracle a title to work from.");
        }
        if (isLive()) {
            try {
                String text = chatClient.prompt()
                        .system(SYSTEM + "\nDraft a concise job brief with four short sections: The Work, Deliverables, Skills, Timing. "
                                + "Use plain text labels. No markdown headings with hash marks.")
                        .user(u -> u.text("Title: {title}\nRegion: {region}\nNotes: {notes}")
                                .param("title", title).param("region", region)
                                .param("notes", notes.isBlank() ? "none supplied" : notes))
                        .call()
                        .content();
                return new AiResponse(clean(text), true, model);
            } catch (Exception ex) {
                log.warn("Oracle brief draft failed, falling back: {}", ex.getMessage());
            }
        }
        return new AiResponse(clean(fallbackBrief(title, notes, region)), false, "emberhall-oracle");
    }

    private String clean(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("\u2014", ", ").replace("\u2013", "-").trim();
    }

    private String fallbackCounsel(String prompt, String context) {
        String lower = prompt.toLowerCase(Locale.ROOT);
        if (lower.contains("price") || lower.contains("budget") || lower.contains("rate") || lower.contains("charge")) {
            return """
                    The Oracle reads the purse. Price the work, not the hours alone.

                    1. Fix the scope in writing: deliverables, revision rounds, and the date of delivery.
                    2. Set a floor that covers your time, tools, and the risk of a slow review.
                    3. Add a small buffer for the unexpected. Ten to fifteen percent is honest, not greedy.
                    4. Let the vault do the arguing. Funds are sealed before work begins, so the rate is settled before the first stroke.

                    If the patron pushes back, offer a smaller first milestone rather than a lower total. Shrink the promise, not the worth.
                    """;
        }
        if (lower.contains("proposal") || lower.contains("bid") || lower.contains("pitch")) {
            return """
                    A proposal is an oath, not a poem. Keep it short and specific.

                    Open with the patron's problem in one sentence, in their words.
                    Name the first thing you will build or deliver, and the date.
                    Cite one piece of relevant work and what it proved.
                    State your price and what it includes, then ask one clear question.

                    Avoid promises you cannot seal. A patron trusts a narrow promise kept over a grand promise delayed.
                    """;
        }
        if (lower.contains("dispute") || lower.contains("scope") || lower.contains("contract") || lower.contains("milestone")) {
            return """
                    Before a dispute hardens, do three things.

                    1. Return to the written scope. Quote the exact line that covers the work in question.
                    2. Separate missing work from changed work. One is a breach, the other is a new order.
                    3. Offer a remedy with a date: a revision, a partial release, or a short extension.

                    Keep every exchange in the raven thread. If a warden must rule, a clear record is worth more than a loud argument.
                    """;
        }
        if (lower.contains("hire") || lower.contains("artisan") || lower.contains("freelancer") || lower.contains("talent")) {
            return """
                    Choose the artisan who asks the sharpest questions, not the one who promises the fastest answer.

                    Read their chronicles for repeated praise about the same strength.
                    Give a small paid trial before a large oath.
                    Seal the vault at a sum you can defend, and put the delivery date in the contract.

                    A good hire is a narrow promise, clearly measured, and paid on time.
                    """;
        }
        return """
                The Oracle has heard you. Here is the counsel that holds in most halls.

                Define the outcome in one sentence. If you cannot, the work is not yet ready to be commissioned.
                Write down what is included, what is not, and when it is due.
                Seal the coin before the work begins, and release it only against the delivery.
                Keep the thread of ravens clear, because memory is a poor witness.

                Ask me about pricing, proposals, scoping, disputes, or choosing an artisan, and I will go deeper.
                """ + (context.isBlank() ? "" : "\n\nI have noted your context: " + context);
    }

    private String fallbackProposal(String jobTitle, String skills, String budget, String tone, String highlights) {
        String skillLine = skills == null || skills.isBlank() ? "the craft named in your decree" : skills;
        String purse = budget == null || budget.isBlank() ? "the stated purse" : budget;
        String extra = highlights.isBlank() ? "" : " " + highlights;
        return """
                I read your decree for %s and recognized the work at once.

                My approach is simple. First, I will map the outcome you need and the constraints that matter. Then I will deliver %s in a form you can review and use without translation. I work in short, visible steps, so there are no surprises at the end.

                My bid is %s. It covers the full scope, two rounds of revision, and a clear handover with notes.%s

                I keep my oaths narrow and my delivery dates honest. If this aligns, I can begin as soon as the vault is sealed, and I will send the first checkpoint within three days.

                Shall we discuss the first deliverable?
                """.formatted(jobTitle, skillLine, purse, extra).replace("  ", " ").trim();
    }

    private String fallbackBrief(String title, String notes, String region) {
        return """
                The Work
                %s. This commission sits in %s. %s

                Deliverables
                A complete, usable final delivery with source files where relevant.
                Two rounds of revision inside the agreed scope.
                A short handover note covering decisions, setup, and next steps.

                Skills
                The craft named in the title, clear written communication, and the discipline to flag risk early.

                Timing
                Propose a first checkpoint within three days and a full delivery date with your bid.
                """.formatted(title, region, notes.isBlank() ? "Add the constraints that matter most." : notes);
    }
}
