import CrmSalesReport from '../models/salesReportModel.js';
import CrmUser from '../models/userModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// export const createSalesReport = async (req, res) => {
//   try {
//     const { meetings, date } = req.body;

//     // Parse meetings
//     let parsedMeetings;
//     try {
//       parsedMeetings = JSON.parse(meetings);
//       if (!Array.isArray(parsedMeetings)) throw new Error();
//     } catch {
//       return res.status(400).json({ message: 'Meetings must be a valid JSON array' });
//     }

//     // Get the single visitingCard file
//     const visitingCardFile = req.file;

//     const formattedMeetings = parsedMeetings.map((meeting) => ({
//       firmName: meeting.firmName,
//       ownerName: meeting.ownerName,
//       phoneNumber: meeting.phoneNumber,
//       email: meeting.email,
//       teamSize: meeting.teamSize,
//       rera: meeting.rera,
//       remark: meeting.remark,
//       visitingCard: visitingCardFile ? `uploads/${visitingCardFile.filename}` : null,
//     }));

//     const report = await CrmSalesReport.create({
//       user: req.user.id,
//       date,
//       meetings: formattedMeetings,
//     });

//     res.status(201).json({
//       message: 'Sales report created successfully',
//       report,
//     });
//   } catch (err) {
//     console.error('Sales report creation failed:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };




// GET /api/sales-reports?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// export const getSalesReports = async (req, res) => {
//   try {
//     const { role, id } = req.user;
//     const { startDate, endDate, userId } = req.query; // Add userId to destructured params

//     const query = {};

//     // Date filtering (unchanged)
//     if (startDate || endDate) {
//       query.date = {};
//       if (startDate) query.date.$gte = new Date(startDate);
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         query.date.$lte = end;
//       }
//     }

//     // User filtering logic - updated to handle specific user selection
//     if (userId && userId !== 'all') {
//       // If a specific user is selected, verify the requesting user has permission
//       if (role === 'admin') {
//         query.user = userId; // Admins can view any user's reports
//       } else if (role === 'manager') {
//         // Verify the requested user is under this manager
//         const isTeamMember = await CrmUser.exists({ _id: userId, managerId: id });
//         if (!isTeamMember) {
//           return res.status(403).json({ message: 'You can only view your team members\' reports' });
//         }
//         query.user = userId;
//       } else if (role === 'user') {
//         // Regular users can only view their own reports
//         if (userId !== id) {
//           return res.status(403).json({ message: 'You can only view your own reports' });
//         }
//         query.user = id;
//       }
//     } else {
//       // No specific user selected - apply role-based default filtering
//       if (role === 'user') {
//         query.user = id;
//       } else if (role === 'manager') {
//         const assignedUsers = await CrmUser.find({ managerId: id }, '_id');
//         const userIds = assignedUsers.map(user => user._id);
//         query.user = { $in: userIds };
//       }
//       // Admin sees all - no user filter needed
//     }

//     const reports = await CrmSalesReport.find(query)
//     .populate({
//       path: 'user',
//       select: 'name email role managerId',
//       populate: {
//         path: 'managerId',
//         select: '_id name'
//       }
//     })
//     .sort({ date: -1 });

//     res.status(200).json({ reports });

//   } catch (err) {
//     console.error('Error fetching sales reports:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


export const createSalesReport = async (req, res) => {
  try {
    const { meetings, date } = req.body;

    // Parse meetings from JSON string
    let parsedMeetings;
    try {
      parsedMeetings = JSON.parse(meetings);
      if (!Array.isArray(parsedMeetings)) throw new Error();
    } catch {
      return res.status(400).json({ message: 'Meetings must be a valid JSON array' });
    }

    const visitingCardFile = req.file;

    // Prepare formatted meetings with status & followUps
    const formattedMeetings = parsedMeetings.map((meeting) => {
      // Validate status
      const validStatuses = ["Interested", "Not Interested"];
      if (!validStatuses.includes(meeting.status)) {
        throw new Error(`Invalid status '${meeting.status}' for meeting with firm '${meeting.firmName}'`);
      }

      // Prepare followUps array (optional)
      const followUps = Array.isArray(meeting.followUps)
        ? meeting.followUps.map((followUp) => ({
            date: new Date(followUp.date),
            remark: followUp.remark || "",
          }))
        : [];

      return {
        firmName: meeting.firmName,
        ownerName: meeting.ownerName,
        phoneNumber: meeting.phoneNumber,
        email: meeting.email,
        teamSize: meeting.teamSize,
        rera: meeting.rera,
        remark: meeting.remark,
        status: meeting.status,
        visitingCard: visitingCardFile ? `uploads/${visitingCardFile.filename}` : null,
        followUps,
      };
    });

    const report = await CrmSalesReport.create({
      user: req.user.id,
      date,
      meetings: formattedMeetings,
    });

    res.status(201).json({
      message: 'Sales report created successfully',
      report,
    });
  } catch (err) {
    console.error('Sales report creation failed:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


export const getSalesReports = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { 
      startDate, 
      endDate, 
      userId, 
      page = 1,    // Add page parameter with default value 1
      limit = 10    // Add limit parameter with default value 10
    } = req.query;

    const query = {};

    // Date filtering (unchanged)
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // User filtering logic - updated to handle specific user selection
    if (userId && userId !== 'all') {
      // If a specific user is selected, verify the requesting user has permission
      if (role === 'admin') {
        query.user = userId; // Admins can view any user's reports
      } else if (role === 'manager') {
        // Verify the requested user is under this manager
        const isTeamMember = await CrmUser.exists({ _id: userId, managerId: id });
        if (!isTeamMember) {
          return res.status(403).json({ message: 'You can only view your team members\' reports' });
        }
        query.user = userId;
      } else if (role === 'user') {
        // Regular users can only view their own reports
        if (userId !== id) {
          return res.status(403).json({ message: 'You can only view your own reports' });
        }
        query.user = id;
      }
    } else {
      // No specific user selected - apply role-based default filtering
      if (role === 'user') {
        query.user = id;
      } else if (role === 'manager') {
        const assignedUsers = await CrmUser.find({ managerId: id }, '_id');
        const userIds = assignedUsers.map(user => user._id);
        query.user = { $in: userIds };
      }
      // Admin sees all - no user filter needed
    }

    // Convert page and limit to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count of documents (for pagination info)
    const total = await CrmSalesReport.countDocuments(query);

    const reports = await CrmSalesReport.find(query)
      .populate({
        path: 'user',
        select: 'name email role managerId',
        populate: {
          path: 'managerId',
          select: '_id name'
        }
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({ 
      reports,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });

  } catch (err) {
    console.error('Error fetching sales reports:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



export const editSalesReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { meetings, date } = req.body;
    const visitingCardFile = req.file;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the report
     const report = await CrmSalesReport.findById(reportId)
      .populate({
        path: 'user',
        select: 'managerId',
        populate: {
          path: 'managerId',
          select: '_id'
        }
      });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Authorization check - only the creator can edit
    const isCreator = report.user._id.toString() === userId;
    const isAdmin = userRole === 'admin';
    const isManagerOfCreator = userRole === 'manager' && report.user.managerId?._id?.toString() === userId;

    if (!isCreator && !isManagerOfCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this report' });
    }

    // Parse meetings if provided
    let parsedMeetings = report.meetings;
    if (meetings) {
      try {
        parsedMeetings = JSON.parse(meetings);
        if (!Array.isArray(parsedMeetings)) throw new Error();
      } catch {
        return res.status(400).json({ message: 'Meetings must be a valid JSON array' });
      }
    }

    // Handle visiting card updates
    if (visitingCardFile) {
      // Delete old visiting card if exists
      if (report.meetings[0]?.visitingCard) {
        const oldFilePath = path.join(process.cwd(), report.meetings[0].visitingCard);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Update all meetings with new visiting card path
      parsedMeetings = parsedMeetings.map(meeting => ({
        ...meeting,
        visitingCard: `uploads/${visitingCardFile.filename}`
      }));
    }

    // Prepare update data
    const updateData = {};
    if (date) updateData.date = date;
    if (meetings) updateData.meetings = parsedMeetings;

    // Update the report
    const updatedReport = await CrmSalesReport.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true }
    ).populate('user', 'name email role');

    res.status(200).json({
      message: 'Report updated successfully',
      report: updatedReport
    });

  } catch (err) {
    console.error('Error updating sales report:', err);
    res.status(500).json({ 
      message: 'Failed to update report', 
      error: err.message 
    });
  }
};


export const deleteSalesReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId, role: userRole } = req.user;

    // Find the report first to check ownership
    const report = await CrmSalesReport.findById(reportId)
      .populate({
        path: 'user',
        select: 'managerId',
        populate: {
          path: 'managerId',
          select: '_id'
        }
      });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Authorization check - only the creator can edit
    const isCreator = report.user._id.toString() === userId;
    const isAdmin = userRole === 'admin';
    const isManagerOfCreator = userRole === 'manager' && report.user.managerId?._id?.toString() === userId;

    if (!isCreator && !isManagerOfCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this report' });
    }

    // Delete any associated visiting card files
    if (report.meetings && report.meetings.length > 0) {
      for (const meeting of report.meetings) {
        if (meeting.visitingCard) {
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = path.dirname(__filename);
          const filePath = path.join(__dirname, '../', meeting.visitingCard);
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error deleting file:', err);
            });
          }
        }
      }
    }

    // Delete the report
    await CrmSalesReport.findByIdAndDelete(reportId);

    res.status(200).json({ 
      success: true,
      message: 'Report deleted successfully' 
    });

  } catch (err) {
    console.error('Error deleting sales report:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete report',
      error: err.message 
    });
  }
};


export const addFollowUpToMeeting = async (req, res) => {
  try {
    const { salesReportId } = req.params;
    const { meetingId, date, remark } = req.body;

    if (!meetingId || !date) {
      return res.status(400).json({ message: "meetingId and date are required" });
    }

    const report = await CrmSalesReport.findById(salesReportId);
    if (!report) {
      return res.status(404).json({ message: "Sales report not found" });
    }

    const meeting = report.meetings.id(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found in this report" });
    }

    if (!Array.isArray(meeting.followUps)) {
      meeting.followUps = [];
    }

    meeting.followUps.push({
      date: new Date(date),
      remark: remark || "",
    });

    await report.save();

    res.status(200).json({
      message: "Follow-up added successfully",
      updatedMeeting: meeting,
    });
  } catch (err) {
    console.error("Error adding follow-up:", err);
    res.status(500).json({
      message: "Failed to add follow-up",
      error: err.message,
    });
  }
};


export const getAllFollowUps = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let userFilter = {};

    if (role === 'user') {
      userFilter.user = userId;
    } else if (role === 'manager') {
      const teamMembers = await CrmUser.find({ managerId: userId }, '_id');
      const teamIds = teamMembers.map(member => member._id);
      userFilter.user = { $in: teamIds };
    }
    // Admin sees all — no filter

    const reports = await CrmSalesReport.find(userFilter).populate('user', 'name email');

    const followUps = [];

    reports.forEach(report => {
      report.meetings.forEach(meeting => {
        if (Array.isArray(meeting.followUps)) {
          meeting.followUps.forEach(fu => {
            followUps.push({
              reportId: report._id,
              user: report.user,
              meetingId: meeting._id,
              firmName: meeting.firmName,
              followUp: fu,
            });
          });
        }
      });
    });

    res.status(200).json({ followUps });

  } catch (err) {
    console.error('Error fetching follow-ups:', err);
    res.status(500).json({ message: 'Failed to fetch follow-ups', error: err.message });
  }
};


export const getTodaysFollowUps = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let userFilter = {};

    if (role === 'user') {
      userFilter.user = userId;
    } else if (role === 'manager') {
      const teamMembers = await CrmUser.find({ managerId: userId }, '_id');
      const teamIds = teamMembers.map(member => member._id);
      userFilter.user = { $in: teamIds };
    }
    // Admin sees all — no filter

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const reports = await CrmSalesReport.find(userFilter).populate('user', 'name email');

    const todaysFollowUps = [];

    reports.forEach(report => {
      report.meetings.forEach(meeting => {
        if (Array.isArray(meeting.followUps)) {
          meeting.followUps.forEach(fu => {
            const fuDate = new Date(fu.date);
            if (fuDate >= todayStart && fuDate <= todayEnd) {
              todaysFollowUps.push({
                reportId: report._id,
                user: report.user,
                meetingId: meeting._id,
                firmName: meeting.firmName,
                followUp: fu,
              });
            }
          });
        }
      });
    });

    res.status(200).json({ todaysFollowUps });

  } catch (err) {
    console.error('Error fetching today\'s follow-ups:', err);
    res.status(500).json({ message: 'Failed to fetch today\'s follow-ups', error: err.message });
  }
};

