import { jwtDecode } from 'jwt-decode';

export const getToken = () => {
    const role = localStorage.getItem('role'); // Use stored role
    console.log('Role from localStorage:', role);
    return role;
    
};

export const getUserRole = () => {
    const token = getToken();
    if (!token) {
        console.log('No token found in localStorage');
        return null;
    }

    try {
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded); // Debug decoded token
        return decoded.role;
    } catch (error) {
        console.error('Error decoding the token', error.message);
        return null;
    }
};

export const isAuthenticated = () => !!getToken();

export const isAdmin = () => {
    const role = getUserRole();
    console.log('User role:', role);
    return role?.toLowerCase() === 'admin';
};