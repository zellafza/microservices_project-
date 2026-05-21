package com.hospital.doctor;

import com.hospital.doctor.health.DoctorHealthCheck;
import com.hospital.doctor.resource.DoctorResource;
import io.dropwizard.Application;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import org.eclipse.jetty.servlets.CrossOriginFilter;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import java.util.EnumSet;

public class DoctorApplication extends Application<DoctorConfiguration> {

    public static void main(String[] args) throws Exception {
        new DoctorApplication().run(args);
    }

    @Override
    public String getName() {
        return "doctor-service";
    }

    @Override
    public void initialize(Bootstrap<DoctorConfiguration> bootstrap) {
    }

    @Override
    public void run(DoctorConfiguration configuration, Environment environment) {
        FilterRegistration.Dynamic cors = environment.servlets()
                .addFilter("CORS", CrossOriginFilter.class);
        cors.setInitParameter(CrossOriginFilter.ALLOWED_ORIGINS_PARAM, "*");
        cors.setInitParameter(CrossOriginFilter.ALLOWED_METHODS_PARAM, "GET,POST,PUT,DELETE,OPTIONS");
        cors.setInitParameter(CrossOriginFilter.ALLOWED_HEADERS_PARAM, "*");
        cors.addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");

        environment.jersey().register(new DoctorResource());
        environment.healthChecks().register("doctor", new DoctorHealthCheck());
    }
}
