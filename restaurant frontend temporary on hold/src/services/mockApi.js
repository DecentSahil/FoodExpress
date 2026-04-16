import axios from 'axios';

// Mocking Axios for local demonstration
const mockApi = axios.create();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const initialCategories = [
    { id: 1, name: 'Starters', description: 'Begin your meal with our fine appetizers.', count: 12 },
    { id: 2, name: 'Main Course', description: 'Exquisite entrees crafted with precision.', count: 24 },
    { id: 3, name: 'Desserts', description: 'Sweet conclusions to your culinary journey.', count: 8 },
    { id: 4, name: 'Eno-Cellar', description: 'Curated collection of world-class wines.', count: 15 },
];

const initialMenuItems = [
    { id: 101, name: 'Saffron Salmon', category: 'Starters', price: 24, available: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&h=200&fit=crop' },
    { id: 102, name: 'Truffle Kebab', category: 'Starters', price: 28, available: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=200&h=200&fit=crop' },
    { id: 103, name: 'Butter Lobster', category: 'Main Course', price: 58, available: true, image: 'https://images.unsplash.com/photo-1534080564607-c9275445f29c?q=80&w=200&h=200&fit=crop' },
];

export const getCategories = async () => {
    await delay(800);
    return [...initialCategories];
};

export const getMenuItems = async () => {
    await delay(1000);
    return [...initialMenuItems];
};

export const saveCategory = async (category) => {
    await delay(1200);
    return { ...category, id: Math.floor(Math.random() * 1000) };
};

export const saveMenuItem = async (item) => {
    await delay(1500);
    return { ...item, id: Math.floor(Math.random() * 1000) };
};
