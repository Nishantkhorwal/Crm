import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CrmUser from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;


// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await CrmUser.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await CrmUser.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await CrmUser.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


export const editUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password } = req.body;

    const updatedFields = { name, email };
    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await CrmUser.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await CrmUser.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User fetched successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
