import axios from 'axios';
import bcrypt from 'bcryptjs';
import { sanitise } from '../utils/validation';

// Use HTTPS in production, HTTP only for local dev
const BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : `https://${window.location.hostname}:3001`;

const SALT_ROUNDS = 10;

// Register — sanitise inputs, check duplicate, hash password
export const registerUser = async ({ name, email, password }) => {
  const cleanName = sanitise(name);
  const cleanEmail = sanitise(email);

  const existing = await axios.get(`${BASE_URL}/users?email=${encodeURIComponent(cleanEmail)}`);
  if (existing.data.length > 0) {
    throw new Error('Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const response = await axios.post(`${BASE_URL}/users`, {
    name: cleanName,
    email: cleanEmail,
    password: hashedPassword,
  });

  return response.data;
};

// Login — sanitise email, fetch by email, bcrypt compare
export const loginUser = async ({ email, password }) => {
  const cleanEmail = sanitise(email);

  const response = await axios.get(`${BASE_URL}/users?email=${encodeURIComponent(cleanEmail)}`);

  if (response.data.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = response.data[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return user;
};
