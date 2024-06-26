import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import patientService from '../../services/patients';
import { Patient } from '../../types';

const PatientInfoPage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);

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
    </Box>
  );
};

export default PatientInfoPage;