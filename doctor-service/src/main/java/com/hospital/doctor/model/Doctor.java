package com.hospital.doctor.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Doctor {

    private long id;
    private String name;
    private String surname;
    private String specialty;
    private String phone;
    private String email;
    private boolean available;

    public Doctor() {}

    public Doctor(long id, String name, String surname, String specialty,
                  String phone, String email, boolean available) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.specialty = specialty;
        this.phone = phone;
        this.email = email;
        this.available = available;
    }

    @JsonProperty
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    @JsonProperty
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    @JsonProperty
    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }

    @JsonProperty
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    @JsonProperty
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    @JsonProperty
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    @JsonProperty
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
