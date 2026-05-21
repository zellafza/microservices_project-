package com.hospital.activitylog;

import io.vertx.core.Vertx;

public class ActivityLogApplication {
    public static void main(String[] args) {
        Vertx vertx = Vertx.vertx();
        vertx.deployVerticle(new ActivityLogVerticle(), result -> {
            if (result.succeeded()) {
                System.out.println("[Activity Log Service] Verticle deployed: " + result.result());
            } else {
                System.err.println("[Activity Log Service] Deploy failed: " + result.cause().getMessage());
            }
        });
    }
}
