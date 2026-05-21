package com.hospital.appointment;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static spark.Spark.*;

public class AppointmentService {

    private static final String LOG_URL =
            System.getenv().getOrDefault("LOG_SERVICE_URL", "http://activity-log-service:8085") + "/logs";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    private static void sendLog(String message, String level) {
        try {
            String body = String.format(
                    "{\"service\":\"Appointment Service\",\"message\":\"%s\",\"level\":\"%s\"}",
                    message.replace("\"", "'"), level);
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(LOG_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            httpClient.sendAsync(req, HttpResponse.BodyHandlers.ofString());
        } catch (Exception ignored) {}
    }

    private static void sendLog(String message) { sendLog(message, "INFO"); }

    private static final Map<Long, Appointment> appointments = new HashMap<>();
    private static final AtomicLong idGenerator = new AtomicLong(1);
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private static final DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    static class Appointment {
        long id;
        long patientId;
        long doctorId;
        String appointmentDate;
        String description;
        String status;
        String createdAt;

        Appointment() {}

        Appointment(long patientId, long doctorId, String appointmentDate,
                    String description, String status, String createdAt) {
            this.patientId = patientId;
            this.doctorId = doctorId;
            this.appointmentDate = appointmentDate;
            this.description = description;
            this.status = status;
            this.createdAt = createdAt;
        }
    }

    private static void loadSampleData() {
        String now = LocalDateTime.now().format(formatter);

        // Randevu 1: Mehmet Yilmaz → Dr. Ahmet Yilmaz (Kardiyoloji)
        Appointment a1 = new Appointment(1L, 1L, "2025-06-10 09:00",
                "Rutin kalp kontrolu, efor testi planlanacak", "TAMAMLANDI", now);
        a1.id = idGenerator.getAndIncrement();
        appointments.put(a1.id, a1);

        // Randevu 2: Ayse Kaya → Dr. Ayse Demir (Noroloji)
        Appointment a2 = new Appointment(2L, 2L, "2025-06-11 10:30",
                "Siddetli bas agrisi ve migren sikayeti", "BEKLIYOR", now);
        a2.id = idGenerator.getAndIncrement();
        appointments.put(a2.id, a2);

        // Randevu 3: Mustafa Demir → Dr. Fatma Celik (Dahiliye)
        Appointment a3 = new Appointment(3L, 4L, "2025-06-09 14:00",
                "Tip 2 diyabet takip randevusu, HbA1c sonuclari gorusulecek", "TAMAMLANDI", now);
        a3.id = idGenerator.getAndIncrement();
        appointments.put(a3.id, a3);

        // Randevu 4: Ali Arslan → Dr. Hasan Ozturk (Genel Cerrahi)
        Appointment a4 = new Appointment(5L, 5L, "2025-06-12 11:00",
                "Apandisit ameliyati oncesi muayene ve kan tahlili", "BEKLIYOR", now);
        a4.id = idGenerator.getAndIncrement();
        appointments.put(a4.id, a4);

        // Randevu 5: Hasan Dogan → Dr. Ahmet Yilmaz (Kardiyoloji)
        Appointment a5 = new Appointment(7L, 1L, "2025-06-13 15:30",
                "Hipertansiyon kontrolu, yeni ilac dozu ayarlanacak", "BEKLIYOR", now);
        a5.id = idGenerator.getAndIncrement();
        appointments.put(a5.id, a5);
    }

    public static void main(String[] args) {
        port(8082);

        before((req, res) -> {
            res.type("application/json");
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        });

        options("/*", (req, res) -> {
            res.status(200);
            return "OK";
        });

        loadSampleData();
        sendLog("Randevu servisi başlatıldı — Spark Java");

        // GET /health
        get("/health", (req, res) -> {
            Map<String, Object> health = new LinkedHashMap<>();
            health.put("status", "UP");
            health.put("service", "appointment-service");
            health.put("totalAppointments", appointments.size());
            return gson.toJson(health);
        });

        // GET /api/appointments
        get("/api/appointments", (req, res) -> {
            List<Appointment> list = new ArrayList<>(appointments.values());
            return gson.toJson(list);
        });

        // GET /api/appointments/patient/:patientId
        get("/api/appointments/patient/:patientId", (req, res) -> {
            long patientId = Long.parseLong(req.params(":patientId"));
            List<Appointment> filtered = appointments.values().stream()
                    .filter(a -> a.patientId == patientId)
                    .collect(Collectors.toList());
            return gson.toJson(filtered);
        });

        // GET /api/appointments/doctor/:doctorId
        get("/api/appointments/doctor/:doctorId", (req, res) -> {
            long doctorId = Long.parseLong(req.params(":doctorId"));
            List<Appointment> filtered = appointments.values().stream()
                    .filter(a -> a.doctorId == doctorId)
                    .collect(Collectors.toList());
            return gson.toJson(filtered);
        });

        // GET /api/appointments/:id
        get("/api/appointments/:id", (req, res) -> {
            long id = Long.parseLong(req.params(":id"));
            Appointment appointment = appointments.get(id);
            if (appointment == null) {
                res.status(404);
                return gson.toJson(Map.of("error", "Appointment not found", "id", id));
            }
            return gson.toJson(appointment);
        });

        // POST /api/appointments
        post("/api/appointments", (req, res) -> {
            Appointment appointment = gson.fromJson(req.body(), Appointment.class);
            appointment.id = idGenerator.getAndIncrement();
            appointment.status = "BEKLIYOR";
            appointment.createdAt = LocalDateTime.now().format(formatter);
            appointments.put(appointment.id, appointment);
            sendLog("Yeni randevu oluşturuldu — Hasta ID: " + appointment.patientId + ", Hekim ID: " + appointment.doctorId);
            res.status(201);
            return gson.toJson(appointment);
        });

        // PUT /api/appointments/:id
        put("/api/appointments/:id", (req, res) -> {
            long id = Long.parseLong(req.params(":id"));
            Appointment existing = appointments.get(id);
            if (existing == null) {
                res.status(404);
                return gson.toJson(Map.of("error", "Appointment not found", "id", id));
            }
            Appointment updated = gson.fromJson(req.body(), Appointment.class);
            updated.id = id;
            if (updated.createdAt == null) {
                updated.createdAt = existing.createdAt;
            }
            if (updated.status == null) {
                updated.status = existing.status;
            }
            appointments.put(id, updated);
            sendLog("Randevu güncellendi — ID: " + id + ", Durum: " + updated.status);
            return gson.toJson(updated);
        });

        // DELETE /api/appointments/:id
        delete("/api/appointments/:id", (req, res) -> {
            long id = Long.parseLong(req.params(":id"));
            Appointment removed = appointments.remove(id);
            if (removed == null) {
                res.status(404);
                return gson.toJson(Map.of("error", "Appointment not found", "id", id));
            }
            sendLog("Randevu silindi — ID: " + id, "WARN");
            return gson.toJson(Map.of("message", "Appointment deleted", "id", id));
        });
    }
}
