import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import patientService from '../../services/patients';
import { Patient, Diagnosis, Entry, OccupationalHealthEntry } from '../../types';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import TransgenderIcon from '@mui/icons-material/Transgender';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WorkIcon from '@mui/icons-material/Work';
import HeartIcon from '@mui/icons-material/Favorite';

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

  const getGenderIcon = (gender: string) => {
    if (gender === 'male') {
      return <MaleIcon />;
    } else if (gender === 'female') {
      return <FemaleIcon />;
    } else {
      return <TransgenderIcon />;
    }
  };

  function isOccupationalHealthEntry(entry: Entry): entry is OccupationalHealthEntry {
    return entry.type === 'OccupationalHealth';
  }

  const getTypeIcon = (entry: Entry) => {
    if (entry.type === 'Hospital') {
      return <LocalHospitalIcon />;
    } else if (isOccupationalHealthEntry(entry)) {
      return <><WorkIcon /> {entry.employerName}</>;
    } else {
      return <MedicalServicesIcon />;
    }
  };

  const getHealthCheckRating = (rating: number) => {
    switch (rating) {
      case 0:
        return <HeartIcon color='success'/>;
      case 1:
        return <HeartIcon color='info'/>;
      case 2:
        return <HeartIcon color='warning'/>;
      case 3:
        return <HeartIcon color='error'/>;
      default:
        return <HeartIcon />;
    }
  };

  if (!patient) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Typography variant="h4">{patient.name} {getGenderIcon(patient.gender)}</Typography>
      <Typography variant="body1">SSN: {patient.ssn}</Typography>
      <Typography variant="body1">Date of Birth: {patient.dateOfBirth}</Typography>
      <Typography variant="body1">Occupation: {patient.occupation}</Typography>
      <div>
        <Typography variant="h5">Entries</Typography>
        {patient.entries.map((entry) => (
        <Box sx={{ border: '2px solid grey', borderRadius: 1, marginBottom: 2 }}>
          <div key={entry.id}>
            <Typography variant="body1">{entry.date} {getTypeIcon(entry)} </Typography>
            <Typography variant='body1'>{entry.description}</Typography>
            <ul>
              {entry.diagnosisCodes?.map((code) => (
                <li key={code}>{code} - {getDiagnosisDescription(code)}</li>
              ))}
            </ul>
            {/* Check the type of the entry and render a suitable component */}
            {entry.type === 'Hospital' && (
              <div>
                <Typography variant="body1">Discharge: {entry.discharge.date} {entry.discharge.criteria}</Typography>
                <Typography variant="body1">diagnose by {entry.specialist}</Typography>
              </div>
            )}
            {entry.type === 'OccupationalHealth' && (
              <div>
                <Typography variant="body1">diagnose by {entry.specialist}</Typography>
              </div>
            )}
            {entry.type === 'HealthCheck' && (
              <div>
                {getHealthCheckRating(entry.healthCheckRating)}
                <Typography variant="body1">diagnose by {entry.specialist}</Typography>
              </div>
            )}
          </div>
        </Box>
        ))}
      </div>
    </Box>
  );
};

export default PatientInfoPage;