import express from 'express';
import upload from '../multerConfig.js'; // your multer setup file
import { uploadExcel, createSingleClient, getAllClients, deleteClient, editClient, addFollowUp, searchLeads, assignLeadToUser, unassignLead } from '../controllers/crmClientController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/upload-excel', upload.single('file'), uploadExcel);
router.post('/create', createSingleClient);
router.get('/get',authenticateUser, getAllClients);
router.put('/edit/:id', editClient);
router.delete('/delete/:id', deleteClient);
router.put("/followup/:id", addFollowUp);

router.get("/search", authenticateUser, searchLeads);
router.post("/assign", authenticateUser,assignLeadToUser);
router.post("/unassign",authenticateUser, unassignLead);

export default router;
