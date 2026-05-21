package com.hospital.patient.resource;

import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
public class LogClient {

    private static final String LOG_URL =
            System.getenv().getOrDefault("LOG_SERVICE_URL", "http://activity-log-service:8085") + "/logs";

    private final HttpClient client = HttpClient.newHttpClient();

    public void log(String message) {
        log(message, "INFO");
    }

    public void log(String message, String level) {
        try {
            String body = String.format(
                    "{\"service\":\"Patient Service\",\"message\":\"%s\",\"level\":\"%s\"}",
                    message.replace("\"", "'"), level);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(LOG_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            // Asenkron — patient servisini bloklamaz
            client.sendAsync(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception ignored) {
            // Log servisi çevrimdışıysa sessizce geç
        }
    }
}
