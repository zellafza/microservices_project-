# Hospital Management System - Microservices

3 farklı Java framework ile geliştirilmiş hastane yönetim sistemi.

## Servisler

| Servis               | Framework   | Port  | Teknoloji        |
|----------------------|-------------|-------|------------------|
| patient-service      | Spring Boot | 8081  | Java 17, H2 DB   |
| appointment-service  | Spark Java  | 8082  | Java 11, In-Memory |
| doctor-service       | Dropwizard  | 8083  | Java 11, In-Memory |

## Başlatma

```bash
cd hospital-microservices
docker-compose up --build
```

## API Endpoints

### Patient Service (Spring Boot) — http://localhost:8081

| Method | URL                          | Açıklama              |
|--------|------------------------------|-----------------------|
| GET    | /api/patients                | Tüm hastalar          |
| GET    | /api/patients/{id}           | ID ile hasta          |
| GET    | /api/patients/tc/{tcNo}      | TC ile hasta          |
| POST   | /api/patients                | Hasta ekle            |
| PUT    | /api/patients/{id}           | Hasta güncelle        |
| DELETE | /api/patients/{id}           | Hasta sil             |
| GET    | /actuator/health             | Health check          |
| GET    | /h2-console                  | H2 DB konsolu         |

### Appointment Service (Spark Java) — http://localhost:8082

| Method | URL                                    | Açıklama               |
|--------|----------------------------------------|------------------------|
| GET    | /api/appointments                      | Tüm randevular         |
| GET    | /api/appointments/{id}                 | ID ile randevu         |
| GET    | /api/appointments/patient/{patientId}  | Hastaya göre randevu   |
| GET    | /api/appointments/doctor/{doctorId}    | Doktora göre randevu   |
| POST   | /api/appointments                      | Randevu ekle           |
| PUT    | /api/appointments/{id}                 | Randevu güncelle       |
| DELETE | /api/appointments/{id}                 | Randevu sil            |
| GET    | /health                                | Health check           |

### Doctor Service (Dropwizard) — http://localhost:8083

| Method | URL                                  | Açıklama              |
|--------|--------------------------------------|-----------------------|
| GET    | /api/doctors                         | Tüm doktorlar         |
| GET    | /api/doctors/{id}                    | ID ile doktor         |
| GET    | /api/doctors/specialty/{specialty}   | Uzmanlığa göre filtre |
| GET    | /api/doctors/available               | Müsait doktorlar      |
| POST   | /api/doctors                         | Doktor ekle           |
| PUT    | /api/doctors/{id}                    | Doktor güncelle       |
| DELETE | /api/doctors/{id}                    | Doktor sil            |
| GET    | http://localhost:8084/healthcheck    | Admin health check    |

## Örnek İstekler

### Hasta Oluştur
```bash
curl -X POST http://localhost:8081/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"Ali","surname":"Veli","tcNo":"12345678901","phone":"555-0001","email":"ali@mail.com","age":35,"bloodType":"A+"}'
```

### Randevu Oluştur
```bash
curl -X POST http://localhost:8082/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"patientId":1,"doctorId":1,"appointmentDate":"2024-04-01 10:00","description":"Kontrol"}'
```

### Doktor Listesi
```bash
curl http://localhost:8083/api/doctors
```
