import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import patientService from '../../services/patients';
import { Patient, Diagnosis } from '../../types';


const PatientInfoPage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);

  useEffect(() => {
  const fetchDiagnoses = async () => {
    try {
      const fetchedDiagnoses: Diagnosis[] = await patientService.getDiagnoses();
      setDiagnoses(fetchedDiagnoses);
    } catch (error) {
      console.error(error);
    }
  };
    fetchDiagnoses();
  }, []);
  useEffect(() => {
    const fetchPatient = async () => {
        if (typeof id === 'string') { // Check if id is defined and is a string
            try {
              const fetchedPatient = await patientService.getOne(id);
              setPatient(fetchedPatient);
            } catch (error) {
              console.error(error);
            }
          } else {
            // Handle the case where id is undefined
            // For example, show an error message or redirect
            console.error('Patient ID is undefined');
          }
        };

    fetchPatient();
  }, [id]);

  const getDiagnosisDescription = (code: string): string => {
    const diagnosis = diagnoses.find((d) => d.code === code);
    return diagnosis ? diagnosis.name : "Unknown diagnosis code";
  };

  if (!patient) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Typography variant="h4">{patient.name}</Typography>
      <Typography variant="body1">SSN: {patient.ssn}</Typography>
      <Typography variant="body1">Date of Birth: {patient.dateOfBirth}</Typography>
      <Typography variant="body1">Gender: {patient.gender}</Typography>
      <Typography variant="body1">Occupation: {patient.occupation}</Typography>
      {/* Add more patient details here */}
      <div>
        <Typography variant="h5">Entries</Typography>
        {patient.entries.map((entry) => (
          <div key={entry.id}>
            <Typography variant="body1">{entry.date} {entry.description}</Typography>
            <ul>
              {entry.diagnosisCodes?.map((code) => (
                <li key={code}>{code} - {getDiagnosisDescription(code)}</li>
              ))}
            </ul>
            {/* Check the type of the entry and render a suitable component */}
            {entry.type === 'Hospital' && (
              <div>
                <Typography variant="body1">Discharge: {entry.discharge.date} {entry.discharge.criteria}</Typography>
              </div>
            )}
            {entry.type === 'OccupationalHealth' && (
              <div>
                <Typography variant="body1">Employer: {entry.employerName}</Typography>
              </div>
            )}
            {entry.type === 'HealthCheck' && (
              <div>
                <Typography variant="body1">Health Check Rating: {entry.healthCheckRating}</Typography>
              </div>
            )}
          </div>
        ))}
      </div>
    </Box>
  );
};

export default PatientInfoPage;