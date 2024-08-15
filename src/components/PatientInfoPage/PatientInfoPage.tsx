import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, TextField, Select, SelectChangeEvent, MenuItem } from '@mui/material';
import patientService from '../../services/patients';
import { Patient, Diagnosis, Entry, OccupationalHealthEntry, PatientFormValues2, HealthCheckRating } from '../../types';
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
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [showEntryButton, setShowEntryButton] = useState(true); // State to control entry button visibility
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [specialist, setSpecialist] = useState('');
  const [healthcheckRating, setHealthcheckRating] = useState(HealthCheckRating.Healthy);
  const [diagnosisCodes, setDiagnosisCodes] = useState<string[]>([]);


  // interface HealthCheckRatingOption{
  //   value: HealthCheckRating;
  //   // label: string;
  // }

  const healthCheckOptions = [
    { value: HealthCheckRating.Healthy, label: 'Healthy' },
    { value: HealthCheckRating.LowRisk, label: 'Low Risk' },
    { value: HealthCheckRating.HighRisk, label: 'High Risk' },
    { value: HealthCheckRating.CriticalRisk, label: 'Critical Risk' },
  ];


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
        return <HeartIcon color='success' />;
      case 1:
        return <HeartIcon color='info' />;
      case 2:
        return <HeartIcon color='warning' />;
      case 3:
        return <HeartIcon color='error' />;
      default:
        return <HeartIcon />;
    }
  };

  if (!patient) {
    return <div>Loading...</div>;
  }


  const toggleFormVisibility = () => {
    setShowForm(!showForm); // Toggle the form visibility
    setShowEntryButton(!showEntryButton); // Toggle the entry button visibility
  };


  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData: PatientFormValues2 = {
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        ssn: patient.ssn,
        occupation: patient.occupation,
        gender: patient.gender,
        entries: [{
          type: 'HealthCheck',
          description,
          date,
          specialist,
          healthcheckRating,
          diagnosisCodes,
        }
      ]
      };
      console.log(formData);

      const newEntry = await patientService.addEntry(id!, formData);
      setPatient((prevPatient) => {
        if (!prevPatient) return null;
        return {
          ...prevPatient,
          entries: [...prevPatient.entries, newEntry] as Entry[],
        };
      });
      toggleFormVisibility();
    } catch (error) {
      console.error(error);
    }
  };

  console.log(HealthCheckRating.Healthy);

  return (
    <Box>
      <Typography variant="h4">{patient.name} {getGenderIcon(patient.gender)}</Typography>
      <Typography variant="body1">SSN: {patient.ssn}</Typography>
      <Typography variant="body1">Date of Birth: {patient.dateOfBirth}</Typography>
      <Typography variant="body1">Occupation: {patient.occupation}</Typography>
      <div>
        {showEntryButton && (
        <Button id='addEntryButton' variant='contained' color='primary' onClick={toggleFormVisibility}>
          add new entry
        </Button>
          )}
      </div>
      {showForm && (
        <Box sx={{ border: '2px solid grey', borderRadius: 1, marginBottom: 2 }}>
          <Typography variant='h5'>Add new entry</Typography>
          <form onSubmit={saveEntry}>
          <div>
            <TextField
              id="description"
              label="Description"
              variant="outlined"
              fullWidth
              margin="normal"
              value={description}
              onChange={({target}) => setDescription(target.value)}
            />
          </div>
          <div>
            <TextField
              id="date"
              label="Date"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              value={date}
              onChange={({target}) => setDate(target.value)}
            />
          </div>
          <div>
            <TextField
              id="specialist"
              label="Specialist"
              variant="outlined"
              fullWidth
              margin="normal"
              value={specialist}
              onChange={({target}) => setSpecialist(target.value)}
            />
          </div>
          <div>
            <Select
              id="type"
              label="Type"
              variant="outlined"
              fullWidth
              value={healthcheckRating.toString()} // Convert healthcheckRating to a string
              onChange={(e: SelectChangeEvent) => setHealthcheckRating(Number(e.target.value) as HealthCheckRating)}
            >
              {healthCheckOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.value} - {option.label}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div>
            <TextField
              id="diagnosisCodes"
              label="Diagnosis Codes"
              variant="outlined"
              fullWidth
              margin="normal"
              value={diagnosisCodes}
              onChange={({target}) => setDiagnosisCodes([target.value])}
            />
          </div>
          <Button variant='contained' color='primary' style={{marginLeft: 10, marginBottom: 10}} onClick={toggleFormVisibility}>cancel</Button>
          <Button style={{float: "right", marginRight: 10}} variant='contained' color='primary' type='submit'>save</Button>
          </form>
        </Box>
      )}
      <div>
        <Typography variant="h5">Entries</Typography>
        {patient.entries.map((entry) => (
          <Box key={entry.id} sx={{ border: '2px solid grey', borderRadius: 1, marginBottom: 2 }}>
            <div>
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