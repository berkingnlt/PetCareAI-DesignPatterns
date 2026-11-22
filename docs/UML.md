# UML Sınıf Diyagramları

GitHub, aşağıdaki Mermaid diyagramlarını gösterebilir. Dosyalardaki tam nitelikli sınıf adları `backend/src/main/java/com/example/demo/` altındadır.

## State

```mermaid
classDiagram
    class AppointmentState {
      <<interface>>
      +code() String
      +quote(context,price)
      +confirm(context)
      +reject(context)
      +complete(context)
    }
    AppointmentState <|.. PendingState
    AppointmentState <|.. QuotedState
    AppointmentState <|.. ConfirmedState
    AppointmentState <|.. RejectedState
    AppointmentState <|.. CompletedState
    AppointmentContext --> AppointmentState : delegates
    AppointmentContext --> Appointment : changes status
```

## Strategy

```mermaid
classDiagram
    class ClinicSortingStrategy {
      <<interface>>
      +sort(clinics) List
    }
    ClinicSortingStrategy <|.. NameClinicSortStrategy
    ClinicSortingStrategy <|.. RatingClinicSortStrategy
    ClinicSortingStrategy <|.. ReviewCountClinicSortStrategy
    ClinicSortingContext --> ClinicSortingStrategy
    ClinicSortingStrategy ..> ClinicRanking : sorts
    ClinicRankingService --> ClinicSortingContext
```

## Factory Method

```mermaid
classDiagram
    class VaccineSchedule {
      <<interface>>
      +rulesForAgeWeeks(ageWeeks) Map
    }
    class VaccineScheduleCreator {
      <<abstract>>
      +createSchedule() VaccineSchedule
    }
    VaccineScheduleCreator <|-- CatScheduleCreator
    VaccineScheduleCreator <|-- DogScheduleCreator
    VaccineSchedule <|.. CatVaccineSchedule
    VaccineSchedule <|.. DogVaccineSchedule
    CatScheduleCreator ..> CatVaccineSchedule : creates
    DogScheduleCreator ..> DogVaccineSchedule : creates
```

## Facade

```mermaid
classDiagram
    AppointmentController --> AppointmentFacade : calls
    AppointmentFacade --> AppointmentRepository : persists
    AppointmentFacade --> AvailabilityRepository : reserves/releases
    AppointmentFacade --> AppointmentContext : transitions
    AppointmentContext --> AppointmentState : delegates
```
