const soilServices = [
    { id: 'soil-basic', name: 'Basic Soil Analysis', location: 'Guntur', distance: 11, availability: 'Appointments', types: 'Soil pH, NPK Testing, Organic Matter', fee: 250 },
    { id: 'soil-field', name: 'SoilCare Field Lab', location: 'Tenali', distance: 22, availability: 'Available', types: 'Soil Moisture, pH and NPK Testing', fee: 350 },
    { id: 'soil-mobile', name: 'Mobile Soil Testing Desk', location: 'Vijayawada', distance: 38, availability: 'On request', types: 'Basic Soil Analysis and Soil Moisture', fee: 200 }
];
export const getSoilServices = () => soilServices.map((item) => ({ ...item }));
