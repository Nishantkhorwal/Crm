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
// export const getAllClients = async (req, res) => {
//   try {
//     // Get page and limit from query params or set default
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;

//     const skip = (page - 1) * limit;

//     // Fetch paginated data
//     const clients = await CrmClient.find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     // Get total count for frontend to know how many pages exist
//     const total = await CrmClient.countDocuments();

//     res.status(200).json({
//       clients,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit)
//     });
//   } catch (error) {
//     console.error("Error fetching clients:", error);
//     res.status(500).json({ error: "Failed to fetch clients" });
//   }
// };
export const getAllClients = async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Get filter parameters
    const { 
      search, 
      status, 
      hotLead, 
      dateFilter
    } = req.query;

    // Build the base query
    let query = {};

    // Search filter (name, email, or phone)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search } }
      ];
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Hot lead filter
    if (hotLead && hotLead !== 'All') {
      query.hotLead = hotLead === 'Yes';
    }

    // Date filters
    if (dateFilter) {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      switch (dateFilter) {
        case 'today':
          query.nextTaskDate = { $gte: startOfDay, $lte: endOfDay };
          break;
        case 'overdue':
          query.nextTaskDate = { $lt: startOfDay };
          break;
        case 'thisWeek':
          const startOfWeek = new Date();
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          query.nextTaskDate = { $gte: startOfWeek, $lte: endOfWeek };
          break;
        case 'thisMonth':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 999);
          query.nextTaskDate = { $gte: startOfMonth, $lte: endOfMonth };
          break;
      }
    }

    // Fetch paginated data with filters
    const clients = await CrmClient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count with the same filters
    const total = await CrmClient.countDocuments(query);

    // Get counts for stats
    const todayCount = await CrmClient.countDocuments({
      ...query,
      nextTaskDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const overdueCount = await CrmClient.countDocuments({
      ...query,
      nextTaskDate: { $lt: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    const thisWeekCount = await CrmClient.countDocuments({
      ...query,
      nextTaskDate: {
        $gte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
        $lte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6))
      }
    });

    const pravasaCount = await CrmClient.countDocuments({
      ...query,
      status: "Pravasa Lead"
    });

    const hotLeadCount = await CrmClient.countDocuments({
      ...query,
      hotLead: true
    });
    const statusCounts = await CrmClient.aggregate([
      { $match: query }, // Apply the same filters
      { 
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object format
    const statusCountMap = {};
    statusCounts.forEach(item => {
      statusCountMap[item._id] = item.count;
    });

    res.status(200).json({
      clients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        today: todayCount,
        overdue: overdueCount,
        thisWeek: thisWeekCount,
        pravasa: pravasaCount,
        hotLeads: hotLeadCount
      },
      statusCounts: statusCountMap
    });
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



