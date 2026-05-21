package com.hospital.doctor.health;

import com.codahale.metrics.health.HealthCheck;

public class DoctorHealthCheck extends HealthCheck {

    @Override
    protected Result check() {
        return Result.healthy("Doctor Service calisiyor");
    }
}
