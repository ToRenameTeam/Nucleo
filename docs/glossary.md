# Glossary

In this page, we define the ubiquitous language used across the entire system. The purpose is to ensure a shared, unambiguous understanding of all domain concepts among developers, domain experts, and stakeholders — regardless of the bounded context in which those concepts appear.

## Global Concepts

These terms are shared across multiple bounded contexts. Their definitions represent the canonical, system-wide meaning, independent of any specific context.

| Term         | Definition                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Doctor**   | A medical professional who offers availabilities, performs visits, and authors clinical documents for patients.             |
| **Patient**  | A person who receives medical care, books appointments, and is the subject of clinical documents.                           |
| **Service**  | A medical procedure or examination (e.g. specialist visit, ultrasound) that a doctor can perform and a patient can receive. |
| **Facility** | A healthcare structure where medical visits and services take place.                                                        |
| **Medicine** | A pharmaceutical product that can be included in a medicine prescription.                                                   |

## Bounded Context Glossary

### Users

This context covers everything related to identity, authentication, user profiles, and delegation between patients.

| Term           | Definition                                                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**       | The entity that holds login credentials (email and password) and is responsible for authentication.                                                            |
| **Patient**    | The operational profile associated with a User that enables them to manage their own health data and participate in delegations.                               |
| **Doctor**     | The optional operational profile associated with a User that enables them to act in a professional capacity (e.g. managing their schedule, issuing documents). |
| **Delegation** | An agreement that authorizes one patient (the Delegate) to access and act on behalf of another patient (the Delegator).                                        |
| **Delegator**  | The patient who shares their own data with another user; the passive subject of the delegation.                                                                |
| **Delegate**   | The user who gains access to another patient's data; the active subject of the delegation.                                                                     |

### Appointments

This context covers everything related to doctor availabilities and patient appointment booking.

| Term             | Definition                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Availability** | A time slot in which a doctor is available to receive patients at a specific facility for a specific service type. |
| **Appointment**  | A confirmed booking made by a patient for a specific availability.                                                 |
| **TimeSlot**     | A temporal period defined by a start date/time and a duration.                                                     |
| **ServiceType**  | The type of medical service being offered (e.g. cardiology visit, echocardiogram).                                 |
| **Visit**        | The physical execution of an appointment, recorded when the patient is seen by the doctor.                         |

### Documents

This context covers everything related to medical documents, reports, and prescriptions.

| Term                      | Definition                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Document**              | A clinical file issued by a doctor for a patient.                                                         |
| **Medical Record**        | The complete collection of documents belonging to a patient.                                              |
| **Report**                | A medical report produced after a service has been performed; it represents the outcome of that service.  |
| **Prescription**          | A clinical instruction issued by a doctor.                                                                |
| **Medicine Prescription** | A pharmacological prescription for a patient, containing at least one medicine and its associated dosage. |
| **Dosage**                | The administration instructions for a medicine within a medicine prescription.                            |
| **Service Prescription**  | A prescription issued by a doctor that recommends a specific medical service for a patient.               |

### Master Data

This context covers reference data that is not directly managed by this system but is consumed by other bounded contexts.

| Term            | Definition                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Facility**    | A healthcare structure referenced by the Appointments context. Managed externally.                                       |
| **ServiceType** | A catalogue entry describing a type of medical service. Managed externally and referenced by Appointments and Documents. |
| **Medicine**    | A pharmaceutical product referenced by the Documents context when creating medicine prescriptions. Managed externally.   |

## Actions

All actions that can be performed within the system, grouped by bounded context.

| Action                     | Description                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| **Sign up**                | A user creates their own account along with the associated patient profile.                   |
| **Log in**                 | A user submits credentials to start an authenticated session.                                 |
| **Select profile**         | An authenticated user chooses which identity to operate as (patient or doctor).               |
| **Switch profile**         | An authenticated user switches from their own patient view to a delegator's view.             |
| **Create delegation**      | A patient grants another patient access to their own data.                                    |
| **Accept delegation**      | The invited user confirms they wish to act as a delegate.                                     |
| **Decline delegation**     | The invited user refuses the delegation.                                                      |
| **Revoke delegation**      | The delegating patient withdraws a previously granted delegation.                             |
| **Log access**             | The system records who is accessing data and in which operational context.                    |
| **Create availability**    | A doctor manually enters available time slots for patient bookings.                           |
| **Update availability**    | A doctor modifies one or more of their existing available slots.                              |
| **Delete availability**    | A doctor removes one or more available slots, provided they have not yet been booked.         |
| **Search availability**    | A patient searches for available slots by filtering on doctor, facility, or date.             |
| **Reserve availability**   | A patient temporarily holds a slot for up to 15 minutes while completing the booking process. |
| **Book appointment**       | A patient confirms the booking of a reserved slot, creating a scheduled appointment.          |
| **Reschedule appointment** | A patient changes the date or time of an existing appointment.                                |
| **Cancel appointment**     | A patient or doctor cancels an appointment before it takes place.                             |
| **Complete visit**         | A doctor records that the visit has been carried out.                                         |
| **Register no-show**       | A doctor records that the patient did not attend their appointment.                           |
| **Read medical record**    | A patient or doctor retrieves the list of documents in a patient's medical record.            |
| **Search document**        | A patient or doctor searches for a specific document within a medical record.                 |
| **Download document**      | A patient or doctor downloads a document from a medical record.                               |
| **Analyze document**       | The system processes a newly uploaded document to extract and validate its information.       |
| **Delete document**        | A patient removes a document from their medical record.                                       |
| **Create report**          | A doctor creates a medical report for a service that has been performed.                      |
| **Upload report**          | A patient or doctor uploads the file of a medical report.                                     |
| **Edit report**            | A doctor modifies an existing report.                                                         |
| **Upload prescription**    | A doctor uploads a prescription for a patient.                                                |
| **Archive prescription**   | The system marks a prescription as archived once it has been fulfilled or has expired.        |
