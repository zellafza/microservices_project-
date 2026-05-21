package com.hospital.activitylog;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

public class ActivityLogVerticle extends AbstractVerticle {

    private static final List<JsonObject> logs = new ArrayList<>();
    private static final AtomicLong idGen = new AtomicLong(1);
    private static final DateTimeFormatter fmt =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public void start(Promise<Void> startPromise) {
        Router router = Router.router(vertx);

        // CORS — tüm isteklere izin ver
        router.route().handler(ctx -> {
            ctx.response()
                    .putHeader("Access-Control-Allow-Origin", "*")
                    .putHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
                    .putHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            if (ctx.request().method() == HttpMethod.OPTIONS) {
                ctx.response().setStatusCode(200).end();
            } else {
                ctx.next();
            }
        });

        router.route().handler(BodyHandler.create());

        loadSampleLogs();

        router.get("/health").handler(this::health);
        router.get("/logs").handler(this::getAllLogs);
        router.post("/logs").handler(this::createLog);
        router.delete("/logs").handler(this::clearLogs);

        vertx.createHttpServer()
                .requestHandler(router)
                .listen(8085, result -> {
                    if (result.succeeded()) {
                        System.out.println("[Activity Log Service] Started on port 8085 — Vert.x reactive");
                        startPromise.complete();
                    } else {
                        startPromise.fail(result.cause());
                    }
                });
    }

    private void loadSampleLogs() {
        addLog("Patient Service",     "Sistem başlatıldı, hasta servisi hazır",   "INFO");
        addLog("Doctor Service",      "Hekim listesi başarıyla yüklendi",          "INFO");
        addLog("Appointment Service", "Randevu servisi aktif, 2 örnek kayıt var",  "INFO");
        addLog("Activity Log Service","Activity Log Servisi Vert.x ile başlatıldı","INFO");
    }

    private void addLog(String service, String message, String level) {
        JsonObject log = new JsonObject()
                .put("id",      idGen.getAndIncrement())
                .put("service", service)
                .put("message", message)
                .put("level",   level != null ? level : "INFO")
                .put("time",    LocalDateTime.now().format(fmt));
        logs.add(log);
    }

    // GET /health
    private void health(RoutingContext ctx) {
        ctx.response()
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject()
                        .put("status",    "UP")
                        .put("service",   "activity-log-service")
                        .put("framework", "Vert.x 4.5.1")
                        .put("totalLogs", logs.size())
                        .encode());
    }

    // GET /logs  — en yeni kayıt en üstte
    private void getAllLogs(RoutingContext ctx) {
        JsonArray arr = new JsonArray();
        for (int i = logs.size() - 1; i >= 0; i--) {
            arr.add(logs.get(i));
        }
        ctx.response()
                .putHeader("Content-Type", "application/json")
                .end(arr.encode());
    }

    // POST /logs
    private void createLog(RoutingContext ctx) {
        JsonObject body = ctx.body().asJsonObject();
        if (body == null) {
            ctx.response().setStatusCode(400)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Request body required").encode());
            return;
        }

        String service = body.getString("service", "Unknown Service");
        String message = body.getString("message", "");
        String level   = body.getString("level",   "INFO");

        JsonObject log = new JsonObject()
                .put("id",      idGen.getAndIncrement())
                .put("service", service)
                .put("message", message)
                .put("level",   level)
                .put("time",    LocalDateTime.now().format(fmt));

        logs.add(log);
        System.out.printf("[LOG] [%s] %s — %s%n", level, service, message);

        ctx.response()
                .setStatusCode(201)
                .putHeader("Content-Type", "application/json")
                .end(log.encode());
    }

    // DELETE /logs — logları temizle
    private void clearLogs(RoutingContext ctx) {
        int count = logs.size();
        logs.clear();
        ctx.response()
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject()
                        .put("message", "Tüm loglar temizlendi")
                        .put("deleted", count)
                        .encode());
    }
}
