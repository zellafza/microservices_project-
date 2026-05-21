package com.hospital.patient.resource;

import com.hospital.patient.model.Patient;
import com.hospital.patient.repository.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;
    private final LogClient logClient;

    public PatientController(PatientRepository patientRepository, LogClient logClient) {
        this.patientRepository = patientRepository;
        this.logClient = logClient;
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        Optional<Patient> patient = patientRepository.findById(id);
        return patient.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tc/{tcNo}")
    public ResponseEntity<Patient> getPatientByTcNo(@PathVariable String tcNo) {
        Optional<Patient> patient = patientRepository.findByTcNo(tcNo);
        return patient.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        Patient saved = patientRepository.save(patient);
        logClient.log("Yeni hasta kaydı oluşturuldu: " + saved.getName() + " " + saved.getSurname());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id,
                                                  @RequestBody Patient patientDetails) {
        Optional<Patient> optionalPatient = patientRepository.findById(id);
        if (optionalPatient.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Patient patient = optionalPatient.get();
        patient.setName(patientDetails.getName());
        patient.setSurname(patientDetails.getSurname());
        patient.setTcNo(patientDetails.getTcNo());
        patient.setPhone(patientDetails.getPhone());
        patient.setEmail(patientDetails.getEmail());
        patient.setAge(patientDetails.getAge());
        patient.setBloodType(patientDetails.getBloodType());
        Patient saved = patientRepository.save(patient);
        logClient.log("Hasta bilgileri güncellendi: " + saved.getName() + " " + saved.getSurname());
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        patientRepository.deleteById(id);
        logClient.log("Hasta kaydı silindi — ID: " + id, "WARN");
        return ResponseEntity.ok().build();
    }
}
