import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CrmUser from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;


// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    // Validate role
    if (!['user', 'manager'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "manager".' });
    }

    // If role is 'user', managerId must be provided
    if (role === 'user' && !managerId) {
      return res.status(400).json({ message: 'managerId is required when creating a user.' });
    }

    const existingUser = await CrmUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Only admin can create users or managers
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can register new users.' });
    }

    const user = await CrmUser.create({
      name,
      email,
      password: hashedPassword,
      role,
      createdBy: req.user.id,
      managerId: role === 'user' ? managerId : null
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId
      }
    });
  } catch (err) {
    console.error('Register error:', err);
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

    const token = jwt.sign({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // ✅ include role here
    }, JWT_SECRET);

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role : user.role },
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



export const getAllUsers = async (req, res) => {
  try {
    const users = await CrmUser.find({ role: 'user' }).select('name email _id');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

export const getAllUsersForAdmin = async (req, res) => {
  try {
    // Verify the requesting user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can access all users data' 
      });
    }

    // Fetch all users (both users and managers) with their manager information
    const users = await CrmUser.find()
      .select('name email role managerId')
      .populate({
        path: 'managerId',
        select: 'name email' // Only include name and email of manager
      })
      .lean(); // Convert to plain JavaScript object

    // Transform the data for better frontend consumption
    const transformedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      manager: user.managerId ? {
        _id: user.managerId._id,
        name: user.managerId.name,
        email: user.managerId.email
      } : null
    }));

    res.status(200).json({
      success: true,
      data: transformedUsers
    });

  } catch (err) {
    console.error('Error fetching users for admin:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users data',
      error: err.message 
    });
  }
};

export const getAllManagers = async (req, res) => {
  try {
    const managers = await CrmUser.find({ role: 'manager' }).select('name email _id');
    res.status(200).json(managers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch managers", error: err.message });
  }
};



// Get current user's team members (for managers)
export const getTeamMembers = async (req, res) => {
  try {
    const managerId = req.user.id;
    
    // Verify the requesting user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can access team members' });
    }

    const teamMembers = await CrmUser.find({ managerId }).select('name email role _id');
    res.status(200).json(teamMembers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch team members', error: err.message });
  }
};

// Get all users with role-based filtering
export const getAvailableUsers = async (req, res) => {
  try {
    const { role, id } = req.user;

    let users;
    if (role === 'admin') {
      // Admins can see all regular users (role: 'user')
      users = await CrmUser.find({ role: 'user' }).select('name email role _id managerId');
    } else if (role === 'manager') {
      // Managers can see their team members who are regular users
      users = await CrmUser.find({ 
        managerId: id,
        role: 'user'  // Only get users, not other managers
      }).select('name email role _id');
    } else {
      // Regular users can't see any other users
      users = [];
    }

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to fetch available users', 
      error: err.message 
    });
  }
};

// Get current user info
export const getCurrentUser = async (req, res) => {
  try {
    // The user info is already in req.user from the JWT middleware
    // But we'll fetch fresh data from DB to ensure it's current
    const user = await CrmUser.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user data', error: err.message });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password, role, managerId } = req.body;
    const currentUser = req.user;

    // Only admin can update users
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update users' });
    }

    const userToUpdate = await CrmUser.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize update object
    const updateData = {};

    // Handle basic info updates
    if (name) updateData.name = name;
    if (email) {
      // Check if email is being changed to an existing one
      const emailExists = await CrmUser.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updateData.email = email;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Handle role changes if provided
    if (role) {
      // Validate role
      if (!['user', 'manager'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be "user" or "manager"' });
      }

      // If role is changing
      if (userToUpdate.role !== role) {
        // Handle manager → user transition
        if (userToUpdate.role === 'manager' && role === 'user') {
          if (!managerId) {
            return res.status(400).json({ 
              message: 'managerId is required when changing from manager to user' 
            });
          }

          const newManager = await CrmUser.findOne({ 
            _id: managerId, 
            role: 'manager' 
          });
          if (!newManager) {
            return res.status(400).json({ 
              message: 'The specified manager does not exist or is not a manager' 
            });
          }

          updateData.role = 'user';
          updateData.managerId = managerId;

          // Orphan all users who had this user as their manager
          await CrmUser.updateMany(
            { managerId: userId },
            { $set: { managerId: null } }
          );
        }

        // Handle user → manager transition
        if (userToUpdate.role === 'user' && role === 'manager') {
          updateData.role = 'manager';
          updateData.managerId = null;
        }
      } else if (role === 'user' && managerId) {
        // Just updating manager for existing user
        const newManager = await CrmUser.findOne({ 
          _id: managerId, 
          role: 'manager' 
        });
        if (!newManager) {
          return res.status(400).json({ 
            message: 'The specified manager does not exist or is not a manager' 
          });
        }
        updateData.managerId = managerId;
      }
    }

    // Perform the update
    const updatedUser = await CrmUser.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ 
      message: 'Server error while updating user',
      error: err.message 
    });
  }
};

