package com.hospital.doctor.resource;

import com.hospital.doctor.model.Doctor;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Path("/api/doctors")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DoctorResource {

    private static final Map<Long, Doctor> doctors = new HashMap<>();
    private static final AtomicLong idGenerator = new AtomicLong(5);

    private static final String LOG_URL =
            System.getenv().getOrDefault("LOG_SERVICE_URL", "http://activity-log-service:8085") + "/logs";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    private static void sendLog(String message, String level) {
        try {
            String body = String.format(
                    "{\"service\":\"Doctor Service\",\"message\":\"%s\",\"level\":\"%s\"}",
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

    static {
        doctors.put(1L,  new Doctor(1L,  "Ahmet",   "Yilmaz",  "Kardiyoloji",       "0312 111 2001", "ahmet.yilmaz@hospital.com",   true));
        doctors.put(2L,  new Doctor(2L,  "Ayse",    "Demir",   "Noroloji",           "0312 111 2002", "ayse.demir@hospital.com",     true));
        doctors.put(3L,  new Doctor(3L,  "Mehmet",  "Kaya",    "Ortopedi",           "0312 111 2003", "mehmet.kaya@hospital.com",    false));
        doctors.put(4L,  new Doctor(4L,  "Fatma",   "Celik",   "Dahiliye",           "0312 111 2004", "fatma.celik@hospital.com",    true));
        doctors.put(5L,  new Doctor(5L,  "Hasan",   "Ozturk",  "Genel Cerrahi",      "0312 111 2005", "hasan.ozturk@hospital.com",   true));
        doctors.put(6L,  new Doctor(6L,  "Zeynep",  "Arslan",  "Pediatri",           "0312 111 2006", "zeynep.arslan@hospital.com",  true));
        doctors.put(7L,  new Doctor(7L,  "Ibrahim", "Sahin",   "Psikiyatri",         "0312 111 2007", "ibrahim.sahin@hospital.com",  true));
        doctors.put(8L,  new Doctor(8L,  "Meryem",  "Yildiz",  "Dermatoloji",        "0312 111 2008", "meryem.yildiz@hospital.com",  true));
        doctors.put(9L,  new Doctor(9L,  "Kemal",   "Acar",    "Uroloji",            "0312 111 2009", "kemal.acar@hospital.com",     false));
        doctors.put(10L, new Doctor(10L, "Selin",   "Koc",     "Goz Hastaliklari",   "0312 111 2010", "selin.koc@hospital.com",      true));
        idGenerator.set(11);
    }

    @GET
    public Response getAllDoctors() {
        List<Doctor> list = new ArrayList<>(doctors.values());
        return Response.ok(list).build();
    }

    @GET
    @Path("/{id}")
    public Response getDoctorById(@PathParam("id") long id) {
        Doctor doctor = doctors.get(id);
        if (doctor == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Doctor not found", "id", id))
                    .build();
        }
        return Response.ok(doctor).build();
    }

    @GET
    @Path("/specialty/{specialty}")
    public Response getDoctorsBySpecialty(@PathParam("specialty") String specialty) {
        List<Doctor> filtered = doctors.values().stream()
                .filter(d -> d.getSpecialty().equalsIgnoreCase(specialty))
                .collect(Collectors.toList());
        return Response.ok(filtered).build();
    }

    @GET
    @Path("/available")
    public Response getAvailableDoctors() {
        List<Doctor> available = doctors.values().stream()
                .filter(Doctor::isAvailable)
                .collect(Collectors.toList());
        return Response.ok(available).build();
    }

    @POST
    public Response createDoctor(Doctor doctor) {
        doctor.setId(idGenerator.getAndIncrement());
        doctors.put(doctor.getId(), doctor);
        sendLog("Yeni hekim eklendi: " + doctor.getName() + " " + doctor.getSurname() + " — " + doctor.getSpecialty());
        return Response.status(Response.Status.CREATED).entity(doctor).build();
    }

    @PUT
    @Path("/{id}")
    public Response updateDoctor(@PathParam("id") long id, Doctor doctorDetails) {
        Doctor existing = doctors.get(id);
        if (existing == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Doctor not found", "id", id))
                    .build();
        }
        doctorDetails.setId(id);
        doctors.put(id, doctorDetails);
        sendLog("Hekim bilgileri güncellendi: " + doctorDetails.getName() + " " + doctorDetails.getSurname());
        return Response.ok(doctorDetails).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteDoctor(@PathParam("id") long id) {
        Doctor removed = doctors.remove(id);
        if (removed == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Doctor not found", "id", id))
                    .build();
        }
        sendLog("Hekim kaydı silindi — ID: " + id, "WARN");
        return Response.ok(Map.of("message", "Doctor deleted", "id", id)).build();
    }
}
