import express from 'express';
import upload from '../multerConfig.js'; // your multer setup file
import { uploadExcel, createSingleClient, getAllClients, deleteClient, editClient, addFollowUp } from '../controllers/crmClientController.js';

const router = express.Router();

router.post('/upload-excel', upload.single('file'), uploadExcel);
router.post('/create', createSingleClient);
router.get('/get', getAllClients);
router.put('/edit/:id', editClient);
router.delete('/delete/:id', deleteClient);
router.put("/followup/:id", addFollowUp);

export default router;
