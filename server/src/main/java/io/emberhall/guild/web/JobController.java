package io.emberhall.guild.web;

import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.service.JobService;
import io.emberhall.guild.service.ProposalService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class JobController {

    private final JobService jobs;
    private final ProposalService proposals;
    private final io.emberhall.guild.service.ContractService contracts;

    public JobController(JobService jobs, ProposalService proposals,
                         io.emberhall.guild.service.ContractService contracts) {
        this.jobs = jobs;
        this.proposals = proposals;
        this.contracts = contracts;
    }

    @GetMapping("/jobs")
    public PageResponse<JobResponse> search(@RequestParam(required = false) String q,
                                            @RequestParam(required = false) String region,
                                            @RequestParam(required = false) String type,
                                            @RequestParam(required = false) BigDecimal min,
                                            @RequestParam(required = false) String sort,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "12") int size) {
        return jobs.search(q, region, type, min, sort, page, size);
    }

    @GetMapping("/jobs/{id}")
    public JobResponse get(@PathVariable Long id) {
        return jobs.get(id);
    }

    @GetMapping("/jobs/{id}/proposals")
    public List<ProposalResponse> proposals(@PathVariable Long id) {
        return jobs.proposalsForJob(id);
    }

    @PostMapping("/jobs")
    public JobResponse create(@Valid @RequestBody JobRequest req) {
        return jobs.create(req);
    }

    @PatchMapping("/jobs/{id}")
    public JobResponse update(@PathVariable Long id, @Valid @RequestBody JobRequest req) {
        return jobs.update(id, req);
    }

    @DeleteMapping("/jobs/{id}")
    public SimpleResponse close(@PathVariable Long id) {
        jobs.close(id);
        return new SimpleResponse(true, "The decree is closed.");
    }

    @PostMapping("/jobs/{id}/proposals")
    public ProposalResponse submit(@PathVariable Long id, @Valid @RequestBody ProposalRequest req) {
        return proposals.submit(id, req);
    }

    @PostMapping("/proposals/{id}/accept")
    public ContractResponse accept(@PathVariable Long id) {
        return contracts.acceptProposal(id);
    }

    @PostMapping("/proposals/{id}/withdraw")
    public SimpleResponse withdraw(@PathVariable Long id) {
        proposals.withdraw(id);
        return new SimpleResponse(true, "The proposal is withdrawn.");
    }

    @GetMapping("/my/jobs")
    public List<JobResponse> myJobs() {
        return jobs.myJobs();
    }

    @GetMapping("/my/proposals")
    public List<ProposalResponse> myProposals() {
        return jobs.myProposals();
    }
}
