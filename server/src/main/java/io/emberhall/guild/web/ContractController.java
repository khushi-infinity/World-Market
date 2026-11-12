package io.emberhall.guild.web;

import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.service.ContractService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ContractController {

    private final ContractService contracts;

    public ContractController(ContractService contracts) {
        this.contracts = contracts;
    }

    @GetMapping({"/orders", "/contracts"})
    public List<ContractResponse> list() {
        return contracts.list();
    }

    @GetMapping({"/orders/{id}", "/contracts/{id}"})
    public ContractResponse get(@PathVariable Long id) {
        return contracts.get(id);
    }

    @PostMapping("/orders/{id}/paypal/create")
    public Map<String, Object> createPayPal(@PathVariable Long id) {
        return contracts.createPayPalFunding(id);
    }

    @PostMapping("/orders/{id}/paypal/capture")
    public ContractResponse capturePayPal(@PathVariable Long id, @Valid @RequestBody CaptureRequest req) {
        return contracts.capturePayPalFunding(id, req.paypalOrderId());
    }

    @PostMapping("/orders/{id}/crown/fund")
    public ContractResponse crownFund(@PathVariable Long id) {
        return contracts.fundWithCrown(id);
    }

    @PostMapping("/orders/{id}/deliver")
    public ContractResponse deliver(@PathVariable Long id, @Valid @RequestBody DeliverRequest req) {
        return contracts.deliver(id, req.note(), req.url());
    }

    @PostMapping("/orders/{id}/release")
    public ContractResponse release(@PathVariable Long id) {
        return contracts.release(id);
    }

    @PostMapping("/orders/{id}/dispute")
    public ContractResponse dispute(@PathVariable Long id, @Valid @RequestBody DisputeRequest req) {
        return contracts.dispute(id, req.reason());
    }

    @PostMapping("/orders/{id}/review")
    public ReviewResponse review(@PathVariable Long id, @Valid @RequestBody ReviewRequest req) {
        return contracts.review(id, req.rating(), req.comment());
    }

    @GetMapping("/wallet")
    public WalletResponse wallet() {
        return contracts.wallet();
    }

    @PostMapping("/wallet/withdraw")
    public WalletResponse withdraw(@RequestBody Map<String, BigDecimal> body) {
        return contracts.withdraw(body.get("amount"));
    }
}
