const demoServices = [
    { id: 'buyer-guntur', name: 'Guntur Fresh Produce Hub', category: 'Crop Buyers', location: 'Guntur Market', distance: 8, availability: 'Open today', serviceType: 'Buyer enquiry', services: 'Paddy, tomato and chilli procurement', crops: 'Paddy, Tomato, Chilli', price: '₹1,480/Q', icon: '🌾' },
    { id: 'equipment-nallapadu', name: 'Nallapadu Farm Machinery', category: 'Equipment Rental', location: 'Nallapadu', distance: 4, availability: 'Available', serviceType: 'Rental', services: 'Tractor, rotavator and cultivator rental', equipment: ['Tractor', 'Rotavator', 'Cultivator'], rate: '₹1,800/day', icon: '🚜' },
    { id: 'soil-guntur', name: 'SoilCare Field Lab', category: 'Soil Testing', location: 'Guntur', distance: 11, availability: 'Appointments', serviceType: 'Testing', services: 'NPK, pH and organic carbon testing', fee: '₹250/sample', icon: '🧪' },
    { id: 'inputs-guntur', name: 'Green Basket Agri Inputs', category: 'Agri Input Stores', location: 'Guntur', distance: 13, availability: 'Open today', serviceType: 'Farm supplies', services: 'Seeds, crop nutrition and tools', icon: '🏪' },
    { id: 'storage-tenali', name: 'Tenali Grain Store', category: 'Storage Facilities', location: 'Tenali', distance: 22, availability: 'Limited space', serviceType: 'Storage', services: 'Covered grain storage and bag handling', capacity: '1,200 tonnes', icon: '📦' },
    { id: 'transport-vijayawada', name: 'Harvest Route Transport', category: 'Transport', location: 'Vijayawada', distance: 29, availability: 'Book in advance', serviceType: 'Transport', services: 'Local crop pickup and market transport', icon: '🚚' },
    { id: 'advisory-guntur', name: 'FieldWise Advisory Desk', category: 'Agricultural Services', location: 'Guntur', distance: 15, availability: 'Available', serviceType: 'Advisory', services: 'Crop planning and field inspection support', icon: '🌱' }
];

export const serviceCategories = ['All Services', 'Crop Buyers', 'Equipment Rental', 'Soil Testing', 'Agri Input Stores', 'Storage Facilities', 'Transport', 'Agricultural Services'];
export const getDemoServices = () => demoServices.map((service) => ({ ...service }));
export async function getNearbyServices(location) {
    return { mode: 'demo', location, services: getDemoServices(), disclaimer: 'Service locations shown here are prototype data and are not verified real-world listings.' };
}
