import express from 'express';
import { registerUser, loginUser, editUser, getUser, getAllUsers, getAllManagers, getTeamMembers, getAvailableUsers, getCurrentUser, updateUser, getAllUsersForAdmin } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register',authenticateUser, registerUser);
router.post('/login', loginUser);
router.put('/edit', authenticateUser, editUser);
router.get('/get', authenticateUser, getUser);
router.get("/all", authenticateUser, getAllUsers);
router.get('/managers', authenticateUser, getAllManagers);
router.get('/getusers', authenticateUser, getAllUsersForAdmin);


router.get('/team-members', authenticateUser, getTeamMembers);
router.get('/available-users', authenticateUser, getAvailableUsers);
router.get('/current-user', authenticateUser, getCurrentUser);

router.put(
  '/:userId',
  authenticateUser,
  updateUser
);

export default router;
