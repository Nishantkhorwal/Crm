import CrmClient from '../models/clientModel.js';
import XLSX from 'xlsx';
import fs from 'fs';

// Upload and import from Excel (.xlsx)
export const uploadExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = req.file.path;

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const clientsToInsert = jsonData.map(row => ({
      name: row.Name,
      source: row.Source,
      leadDated: row['Lead Dated']
        ? new Date(row['Lead Dated']).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
        : undefined,

      phone: row.Phone,
      email: row.Email,
      status: row.Status || 'New',
      lastRemark: row.Notes || '',
      nextTaskDate: row.FollowUp
      ? new Date(row.FollowUp).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      : undefined,

      waSent: row['WA Sent']?.toString().toLowerCase() === 'yes',
      interactions: row.Notes ? [{
        date: row['Lead Dated'] ? new Date(row['Lead Dated']) : new Date(),
        remark: row.Notes
      }] : []
    }));

    await CrmClient.insertMany(clientsToInsert);

    fs.unlinkSync(filePath); // Delete uploaded file after processing

    res.status(201).json({ message: 'Clients imported successfully' });
  } catch (error) {
    console.error('Excel upload error:', error);
    res.status(500).json({ message: 'Failed to import clients' });
  }
};



export const createSingleClient = async (req, res) => {
  try {
    const {
      name,
      source,
      leadDated,
      phone,
      email,
      status,
      lastRemark,
      nextTaskDate,
      waSent
    } = req.body;

    const client = new CrmClient({
      name,
      source,
      leadDated: leadDated ? new Date(leadDated) : undefined,
      phone,
      email,
      status: status || 'New',
      lastRemark,
      nextTaskDate: nextTaskDate ? new Date(nextTaskDate) : undefined,
      waSent: waSent === 'true' || waSent === true,
      interactions: lastRemark ? [{
        date: leadDated ? new Date(leadDated) : new Date(),
        remark: lastRemark
      }] : []
    });

    await client.save();
    res.status(201).json({ message: 'Client created successfully', client });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ message: 'Failed to create client' });
  }
};



// GET /api/clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await CrmClient.find().sort({ createdAt: -1 });

    // if (clients.length === 0) {
    //   return res.status(200).json({ message: "No clients found", clients: [] });
    // }

    res.status(200).json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
};





export const editClient = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedClient = await CrmClient.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json({
      message: 'Client updated successfully',
      updatedClient,
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error while updating client' });
  }
};




export const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedClient = await CrmClient.findByIdAndDelete(id);

    if (!deletedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error while deleting client' });
  }
};






export const addFollowUp = async (req, res) => {
  const { id } = req.params;
  const { remark, nextTaskDate } = req.body;

  if (!remark || !nextTaskDate) {
    return res.status(400).json({ error: "Remark and nextTaskDate are required." });
  }

  try {
    const client = await CrmClient.findById(id);
    if (!client) {
      return res.status(404).json({ error: "Client not found." });
    }

    const interaction = {
      remark,
      date: new Date(nextTaskDate),
    };

    client.interactions.push(interaction);
    client.lastRemark = remark;
    client.nextTaskDate = nextTaskDate;

    await client.save();

    res.status(200).json(client);
  } catch (err) {
    console.error("Error adding follow-up:", err);
    res.status(500).json({ error: "Server error while adding follow-up." });
  }
};



