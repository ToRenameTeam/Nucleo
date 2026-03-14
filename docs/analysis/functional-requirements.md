# Functional Requirements

## Users

| F1 | Authentication | The system must allow user authentication through credentials composed of email and password. |
| --- | --- | --- |
| F2 | Dual Doctor-Patient Profiles | The system must support dual profiles, allowing a user to access both as a doctor and as a patient. |

## Patients

### Access and authentication

| F3 | Active Delegation Management | The system must allow a patient to delegate access to their health data to other authorized patients (e.g., family members, caregivers). |
| --- | --- | --- |
| F4 | Passive Delegation Management | The system must allow a patient to access the health data of patients for whom they hold a delegation (e.g., family members, caregivers). |
| F5 | Delegation Notification Sending | The system must send a notification to a patient when a delegation is created in their favor and when it is accepted/rejected/deleted by the delegate. |

### Medical appointments

| F6 | Manual Appointment Booking | The system must allow patients to book appointments through manual service search. |
| --- | --- | --- |
| F7 | Prescription-Based Appointment Booking | The system must allow appointment booking using an existing medical prescription. |
| F8 | Appointment Modification | The system must allow patients to modify existing appointments. |
| F9 | Appointment Cancellation | The system must allow patients to cancel existing appointments. |
| F10 | Appointment List View | The system must display booked appointments in an ordered list format. |
| F11 | Appointment Calendar View | The system must display booked appointments in calendar format. |
| F12 | Medical Appointment Notification Sending | The system must send a notification to the patient if a doctor changes the appointment date/time. |

### Medical documentation

| F13 | Reading Documents Uploaded by Doctors | The system must allow patients to view documents uploaded by doctors. |
| --- | --- | --- |
| F14 | Uploading Personal Documents | The system must allow patients to independently upload personal health documents. |
| F15 | Deleting Personal Documents | The system must allow patients to delete documents uploaded by themselves. |
| F16 | Medical Prescription Notification Sending | The system must send a notification to the patient when a doctor creates a prescription for an appointment or medication in their favor. |

## Admin

### Appointments

| F17 | Availability Entry | The system must allow doctors to enter their time availability for appointments. |
| --- | --- | --- |
| F18 | Booked Appointment Management | The system must allow doctors to view and manage appointments booked by patients. |
| F19 | Medical Appointment Notification Sending | The system must send doctors a notification when a patient books/modifies/cancels an appointment. |

### Documents

| F20 | Document Upload | The system must allow doctors to upload documents (prescriptions, reports) following completed appointments. |
| --- | --- | --- |

### Patient management

| F21 | Medical Record View | The system must allow doctors to view the complete patient medical record in read-only mode. |
| --- | --- | --- |
| F22 | Drug Prescription | The system must allow doctors to issue pharmaceutical prescriptions for patients. |
| F23 | Specialist Visit Prescription | The system must allow doctors to prescribe specialist visits for patients. |

## System

| F24 | Document Analysis | The system analyzes documents uploaded by users, extracting key data and information. |
| --- | --- | --- |
