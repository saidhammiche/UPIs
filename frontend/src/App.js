import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Alert, Card, Row, Col } from 'react-bootstrap';
import { Pencil, Trash, Plus, Check, ExclamationTriangle, XCircle } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const UmweltkennzahlenTable = () => {
  // États pour les données et la gestion de l'interface
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    year: '',
    upi1Value: '',
    upi11Value: ''
  });

  // Charger les données depuis le localStorage au montage du composant
  useEffect(() => {
    const savedData = localStorage.getItem('umweltkennzahlenData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setData(parsedData);
      
      // Extraire les années uniques de toutes les entrées
      const allYears = new Set();
      parsedData.forEach(item => {
        Object.keys(item.values).forEach(year => allYears.add(year));
      });
      setYears(Array.from(allYears).sort());
    } else {
      // Données initiales si aucune donnée n'est sauvegardée
      const initialData = [
        {
          name: "UPI 1",
          description: "CO² Äquivalente Produktion",
          unit: "CO²",
          values: {
            "2016": 130.79, "2017": 105.24, "2018": 107.22, 
            "2019": 102.52, "2020": 93.39, "2021": 90.61, 
            "2022": 70.22, "2023": 57.28
          }
        },
        {
          name: "UPI 1.1",
          description: "CO² Äquivalente pro verarbeiteter Tonne",
          unit: "CO² / to",
          values: {
            "2017": 0.00467, "2018": 0.00476, "2019": 0.00486, 
            "2020": 0.00353, "2021": 0.00278, "2022": 0.00231
          }
        }
      ];
      setData(initialData);
      setYears(['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023']);
      localStorage.setItem('umweltkennzahlenData', JSON.stringify(initialData));
    }
  }, []);

  // Sauvegarder les données dans le localStorage à chaque modification
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem('umweltkennzahlenData', JSON.stringify(data));
      
      // Mettre à jour les années
      const allYears = new Set();
      data.forEach(item => {
        Object.keys(item.values).forEach(year => allYears.add(year));
      });
      setYears(Array.from(allYears).sort());
    }
  }, [data]);

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Afficher un message d'erreur professionnel
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorAlert(true);
    setTimeout(() => setShowErrorAlert(false), 5000);
  };

  // Ajouter une nouvelle année avec les valeurs pour UPI 1 et UPI 1.1
  const handleAddEntry = () => {
    if (!formData.year) {
      showError("Bitte geben Sie ein gültiges Jahr ein.");
      return;
    }

    const yearInt = parseInt(formData.year);
    if (yearInt < 2000 || yearInt > 2100) {
      showError("Bitte geben Sie ein Jahr zwischen 2000 und 2100 ein.");
      return;
    }

    if (!formData.upi1Value || !formData.upi11Value) {
      showError("Bitte geben Sie Werte für beide UPI-Kennzahlen ein.");
      return;
    }

    const upi1Value = parseFloat(formData.upi1Value);
    const upi11Value = parseFloat(formData.upi11Value);

    if (isNaN(upi1Value) || isNaN(upi11Value)) {
      showError("Bitte geben Sie gültige numerische Werte ein.");
      return;
    }

    const year = formData.year;

    // Mettre à jour les données
    const newData = [...data];
    
    // Mettre à jour UPI 1
    if (newData[0]) {
      newData[0].values[year] = upi1Value;
    }
    
    // Mettre à jour UPI 1.1
    if (newData[1]) {
      newData[1].values[year] = upi11Value;
    }
    
    setData(newData);
    setShowSuccessAlert(true);
    setShowAddForm(false);
    setAlertMessage('Neue Daten erfolgreich hinzugefügt!');
    
    // Réinitialiser le formulaire
    setFormData({
      year: '',
      upi1Value: '',
      upi11Value: ''
    });
    
    // Cacher l'alerte après 3 secondes
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  // Éditer une année spécifique
  const handleEdit = (year) => {
    const upi1Value = data[0]?.values[year] || '';
    const upi11Value = data[1]?.values[year] || '';
    
    setFormData({
      year: year,
      upi1Value: upi1Value,
      upi11Value: upi11Value
    });
    setShowAddForm(true);
  };

  // Supprimer une année
  const confirmDelete = (year) => {
    setItemToDelete(year);
    setShowDeleteConfirm(true);
  };

  // Supprimer une année
  const handleDelete = () => {
    const yearToDelete = itemToDelete;
    const newData = [...data];
    
    // Supprimer l'année de UPI 1
    if (newData[0] && newData[0].values[yearToDelete]) {
      delete newData[0].values[yearToDelete];
    }
    
    // Supprimer l'année de UPI 1.1
    if (newData[1] && newData[1].values[yearToDelete]) {
      delete newData[1].values[yearToDelete];
    }
    
    setData(newData);
    setShowDeleteConfirm(false);
    setAlertMessage('Jahr erfolgreich gelöscht!');
    setShowSuccessAlert(true);
    
    // Cacher l'alerte après 3 secondes
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  // Annuler et fermer le formulaire
  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({
      year: '',
      upi1Value: '',
      upi11Value: ''
    });
  };

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4"></h1>
      
      {/* Alerte de succès */}
      {showSuccessAlert && (
        <Alert variant="success" className="d-flex align-items-center">
          <Check size={24} className="me-2" />
          {alertMessage}
        </Alert>
      )}
      
      {/* Alerte d'erreur */}
      {showErrorAlert && (
        <Alert variant="danger" className="d-flex align-items-center">
          <XCircle size={24} className="me-2" />
          {errorMessage}
        </Alert>
      )}
      
      {/* Carte du formulaire */}
      <Card className="mb-4 shadow-sm">
        <Card.Header style={{ backgroundColor: '#3b7695', color: 'white' }} className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Neue Daten hinzufügen
          </h5>
          <Button 
            style={{ backgroundColor: '#3b7695', borderColor: '#3b7695' }} 
            size="sm" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="me-1" /> {showAddForm ? 'Ausblenden' : 'Anzeigen'}
          </Button>
        </Card.Header>
        
        {showAddForm && (
          <Card.Body>
            <Form>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Jahr</Form.Label>
                    <Form.Control
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      placeholder="Z.B.: 2024"
                      min="2000"
                      max="2100"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>UPI 1 Wert</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.00001"
                      name="upi1Value"
                      value={formData.upi1Value}
                      onChange={handleInputChange}
                      placeholder="Wert für UPI 1"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>UPI 1.1 Wert</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.00001"
                      name="upi11Value"
                      value={formData.upi11Value}
                      onChange={handleInputChange}
                      placeholder="Wert für UPI 1.1"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end mt-3">
                <Button variant="outline-secondary" className="me-2" onClick={handleCancel}>
                  Abbrechen
                </Button>
                <Button style={{ backgroundColor: '#3b7695', borderColor: '#3b7695' }} onClick={handleAddEntry}>
                  Hinzufügen
                </Button>
              </div>
            </Form>
          </Card.Body>
        )}
      </Card>
      
      {/* Tableau des données */}
      <div className="table-responsive">
        <Table striped bordered hover className="shadow-sm">
          <thead>
            <tr>
              <th style={{ width: '25%', backgroundColor: '#3b7695', color: 'white' }}>UPI</th>
              <th style={{ width: '15%', backgroundColor: '#3b7695', color: 'white' }}>Einheit</th>
              {years.map(year => (
                <th key={year} className="text-center" style={{ backgroundColor: '#3b7695', color: 'white' }}>
                  {year}
                </th>
              ))}
              <th style={{ width: '10%', backgroundColor: '#3b7695', color: 'white' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className="fw-bold">
                  <div>{item.name}</div>
                  <small className="text-muted">{item.description}</small>
                </td>
                <td>{item.unit}</td>
                {years.map(year => (
                  <td key={year} className="text-center">
                    {item.values[year] !== undefined ? item.values[year] : '-'}
                  </td>
                ))}
                <td>
                  <div className="d-flex justify-content-center">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEdit(years[0])} // Éditer la première année
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => confirmDelete(years[0])} // Supprimer la première année
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <ExclamationTriangle className="text-warning me-2" />
            Löschbestätigung
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sind Sie sicher, dass Sie die Daten für das Jahr {itemToDelete} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Abbrechen
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Löschen
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UmweltkennzahlenTable;