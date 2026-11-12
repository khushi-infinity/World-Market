package io.emberhall.guild.service;

import io.emberhall.guild.web.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class PayPalService {

    private static final Logger log = LoggerFactory.getLogger(PayPalService.class);

    public record PayPalOrder(String id, String approvalUrl, boolean simulated) {
    }

    public record PayPalCapture(String captureId, String status, boolean simulated) {
    }

    private final String clientId;
    private final String clientSecret;
    private final String mode;
    private final String currency;
    private final int feePercent;

    private volatile String cachedToken;
    private volatile Instant tokenExpiry = Instant.EPOCH;

    public PayPalService(@Value("${app.paypal.client-id:}") String clientId,
                         @Value("${app.paypal.client-secret:}") String clientSecret,
                         @Value("${app.paypal.mode:sandbox}") String mode,
                         @Value("${app.paypal.currency:USD}") String currency,
                         @Value("${app.paypal.fee-percent:10}") int feePercent) {
        this.clientId = clientId == null ? "" : clientId.trim();
        this.clientSecret = clientSecret == null ? "" : clientSecret.trim();
        this.mode = mode;
        this.currency = currency;
        this.feePercent = feePercent;
    }

    public boolean isConfigured() {
        return !clientId.isBlank() && !clientSecret.isBlank();
    }

    public String clientId() {
        return clientId;
    }

    public String mode() {
        return mode;
    }

    public String currency() {
        return currency;
    }

    public int feePercent() {
        return feePercent;
    }

    public String baseUrl() {
        return "live".equalsIgnoreCase(mode) ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    }

    public PayPalOrder createOrder(BigDecimal amount, String reference, String description) {
        if (!isConfigured()) {
            String simulatedId = "SANDBOX-" + reference;
            return new PayPalOrder(simulatedId, null, true);
        }
        try {
            Map<String, Object> body = Map.of(
                    "intent", "CAPTURE",
                    "purchase_units", List.of(Map.of(
                            "amount", Map.of(
                                    "currency_code", currency,
                                    "value", amount.setScale(2, RoundingMode.HALF_UP).toPlainString()),
                            "description", description,
                            "custom_id", reference)),
                    "application_context", Map.of(
                            "brand_name", "Emberhall Guild",
                            "user_action", "PAY_NOW",
                            "shipping_preference", "NO_SHIPPING"));

            Map<?, ?> response = RestClient.create()
                    .post()
                    .uri(baseUrl() + "/v2/checkout/orders")
                    .header("Authorization", "Bearer " + accessToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            String id = String.valueOf(response.get("id"));
            String approval = null;
            Object links = response.get("links");
            if (links instanceof List<?> list) {
                for (Object item : list) {
                    if (item instanceof Map<?, ?> link && "approve".equals(link.get("rel"))) {
                        approval = String.valueOf(link.get("href"));
                    }
                }
            }
            return new PayPalOrder(id, approval, false);
        } catch (RestClientResponseException ex) {
            log.warn("PayPal order creation failed: {} {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw ApiException.badRequest("PayPal refused the order. Check your sandbox credentials and try again.");
        } catch (Exception ex) {
            log.warn("PayPal order creation failed", ex);
            throw ApiException.badRequest("The PayPal gate did not answer. Try again shortly.");
        }
    }

    public PayPalCapture captureOrder(String paypalOrderId) {
        if (!isConfigured()) {
            return new PayPalCapture("CROWN-" + paypalOrderId, "COMPLETED", true);
        }
        try {
            Map<?, ?> response = RestClient.create()
                    .post()
                    .uri(baseUrl() + "/v2/checkout/orders/" + paypalOrderId + "/capture")
                    .header("Authorization", "Bearer " + accessToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of())
                    .retrieve()
                    .body(Map.class);

            String status = String.valueOf(response.get("status"));
            String captureId = paypalOrderId;
            Object units = response.get("purchase_units");
            if (units instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Map<?, ?> unit) {
                Object payments = unit.get("payments");
                if (payments instanceof Map<?, ?> pay && pay.get("captures") instanceof List<?> caps && !caps.isEmpty()
                        && caps.get(0) instanceof Map<?, ?> cap) {
                    captureId = String.valueOf(cap.get("id"));
                }
            }
            return new PayPalCapture(captureId, status, false);
        } catch (RestClientResponseException ex) {
            log.warn("PayPal capture failed: {} {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw ApiException.badRequest("PayPal could not capture this payment. The vault remains unsealed.");
        } catch (Exception ex) {
            log.warn("PayPal capture failed", ex);
            throw ApiException.badRequest("The PayPal gate did not answer. Try again shortly.");
        }
    }

    private String accessToken() {
        if (cachedToken != null && Instant.now().isBefore(tokenExpiry.minusSeconds(30))) {
            return cachedToken;
        }
        String basic = Base64.getEncoder()
                .encodeToString((clientId + ":" + clientSecret).getBytes(StandardCharsets.UTF_8));
        Map<?, ?> response = RestClient.create()
                .post()
                .uri(baseUrl() + "/v1/oauth2/token")
                .header("Authorization", "Basic " + basic)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body("grant_type=client_credentials")
                .retrieve()
                .body(Map.class);
        cachedToken = String.valueOf(response.get("access_token"));
        long expires = response.get("expires_in") instanceof Number n ? n.longValue() : 3000L;
        tokenExpiry = Instant.now().plusSeconds(expires);
        return cachedToken;
    }
}
