const storage = [
    { id: 'storage-grain', name: 'Tenali Grain Store', type: 'Grain Storage', location: 'Tenali', capacity: '1,200 tonnes', available: '420 tonnes', price: 4, unit: 'kg/day', availability: 'Limited space' },
    { id: 'storage-cold', name: 'FreshKeep Cold Storage', type: 'Cold Storage', location: 'Guntur', capacity: '300 tonnes', available: '110 tonnes', price: 8, unit: 'kg/day', availability: 'Available' },
    { id: 'storage-warehouse', name: 'Harvest Warehouse', type: 'Warehouse', location: 'Vijayawada', capacity: '2,000 tonnes', available: '850 tonnes', price: 3, unit: 'kg/day', availability: 'Available' },
    { id: 'storage-veg', name: 'GreenBox Vegetable Store', type: 'Vegetable Storage', location: 'Guntur', capacity: '120 tonnes', available: '40 tonnes', price: 6, unit: 'kg/day', availability: 'Limited space' },
    { id: 'storage-fruit', name: 'OrchardCare Fruit Store', type: 'Fruit Storage', location: 'Tenali', capacity: '160 tonnes', available: '90 tonnes', price: 7, unit: 'kg/day', availability: 'Available' }
];
export const getStorage = () => storage.map((item) => ({ ...item }));
