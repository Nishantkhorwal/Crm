import { useEffect, useState } from "react"
import {
  Eye,
  Loader2,
  MessageSquareText,
  Pencil,
  Trash2,
  X,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  User,
  Bell,
  Clock,
} from "lucide-react"

const formatDate = (dateStr) => {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}




const formatInputDate = (dateStr) => {
  return dateStr ? new Date(dateStr).toISOString().split("T")[0] : ""
}

const isToday = (dateStr) => {
  if (!dateStr) return false
  const today = new Date()
  const date = new Date(dateStr)
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const isOverdue = (dateStr) => {
  if (!dateStr) return false
  const today = new Date()
  const date = new Date(dateStr)
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date < today
}

const isThisWeek = (dateStr) => {
  if (!dateStr) return false
  const today = new Date()
  const date = new Date(dateStr)
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
  startOfWeek.setHours(0, 0, 0, 0)
  endOfWeek.setHours(23, 59, 59, 999)
  return date >= startOfWeek && date <= endOfWeek
}

const isThisMonth = (dateStr) => {
  if (!dateStr) return false
  const today = new Date()
  const date = new Date(dateStr)
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

const statusOptions = [
  "New",
  "Unassigned",
  "Closed",
  "Follow Up",
  "Time Given",
  "Not Interested",
  "Details shared on WA",
  "Call Again",
  "Call not Picked",
  "Broker",
  "Already Talking to someone",
  "Phone Off",
  "Phone not reachable",
  "Filled by Mistake",
  "SV Scheduled",
  "SV Did not happen",
  "SV Done",
  "Low Budget",
  "Duplicate Lead",
  "Other Lead",
  "Pravasa Lead"
];


const statusColors = {
  "New": "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "Follow Up": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Time Given": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Not Interested": "bg-rose-50 text-rose-700 border-rose-200",
  "Details shared on WA": "bg-teal-50 text-teal-700 border-teal-200",
  "Call Again": "bg-orange-50 text-orange-700 border-orange-200",
  "Call not Picked": "bg-gray-50 text-gray-600 border-gray-200",
  "Broker": "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  "Already Talking to someone": "bg-purple-50 text-purple-700 border-purple-200",
  "Phone Off": "bg-neutral-50 text-neutral-600 border-neutral-200",
  "Phone not reachable": "bg-slate-50 text-slate-700 border-slate-200",
  "Filled by Mistake": "bg-zinc-50 text-zinc-700 border-zinc-200",
  "SV Scheduled": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "SV Did not happen": "bg-pink-50 text-pink-700 border-pink-200",
  "SV Done": "bg-lime-50 text-lime-700 border-lime-200",
  "Low Budget": "bg-amber-50 text-amber-700 border-amber-200",
  "Duplicate Lead": "bg-stone-50 text-stone-700 border-stone-200",
  "Other Lead": "bg-violet-50 text-violet-700 border-violet-200",
  "Pravasa Lead": "bg-sky-50 text-sky-700 border-sky-200"
};


const dateFilterOptions = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today's Follow-ups" },
  { value: "overdue", label: "Overdue Follow-ups" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
]

const GetClients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedClient, setSelectedClient] = useState(null)
  const [editClient, setEditClient] = useState(null)
  const [deleteClient, setDeleteClient] = useState(null)
  const [followUpClient, setFollowUpClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [hotLeadFilter, setHotLeadFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState(null)
  const [showTodayNotification, setShowTodayNotification] = useState(false)
  const [todayFollowUps, setTodayFollowUps] = useState([])
  const [hotLeads, setHotLeads] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(20); // You can make this configurable if needed
  const [stats, setStats] = useState({
  today: 0,
  overdue: 0,
  thisWeek: 0,
  pravasa: 0,
  hotLeads: 0
});
  const [totalLeads, setTotalLeads] = useState(0);
  const [statusCountMap, setStatusCountMap] = useState({});
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [followUpData, setFollowUpData] = useState({
    remark: "",
    nextTaskDate: "",
  })

  useEffect(() => {
    fetchClients()
  }, [])
  

  useEffect(() => {
    if (clients.length > 0) {
      const todayClients = clients.filter((client) => isToday(client.nextTaskDate))
      setTodayFollowUps(todayClients)
    }
  }, [clients])

  // const fetchClients = async () => {
  //   try {
  //     const res = await fetch(`${API_BASE_URL}/api/client/get`)
  //     const data = await res.json()
  //     if (res.ok) setClients(data)
  //     else setError(data.message || "Failed to fetch clients.")
  //   } catch (err) {
  //     setError("No Leads.")
  //     console.error(err)
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const fetchClients = async (pageNumber = 1) => {
  try {
    setLoading(true);
    
    // Build query params
    const params = new URLSearchParams({
      page: pageNumber,
      limit: perPage,
      ...(searchTerm && { search: searchTerm }),
      ...(statusFilter !== 'All' && { status: statusFilter }),
      ...(hotLeadFilter !== 'All' && { hotLead: hotLeadFilter }),
      ...(dateFilter !== 'all' && { dateFilter: dateFilter }),
      ...(dateFilter === 'custom' && { 
        fromDate: customFromDate, 
        toDate: customToDate 
      })
    });

    

    const res = await fetch(`${API_BASE_URL}/api/client/get?${params}`);
    const data = await res.json();
    console.log("data",data)
    
    if (res.ok) {
      setClients(data.clients);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
      setStats(data.stats || {
        today: 0,
        overdue: 0,
        thisWeek: 0,
        pravasa: 0,
        hotLeads: 0
      });
      setTotalLeads(data.total || 0);
      setStatusCountMap(data.statusCounts || {});
    } else {
      setError(data.message || "Failed to fetch clients.");
    }
  } catch (err) {
    setError("No Leads.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const PaginationControls = () => {
  const maxVisiblePages = 5; // How many page numbers to show at once
  
  // Calculate range of pages to display
  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // Adjust if we're at the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  return (
    <div className="flex items-center justify-center mt-6 space-x-1">
      {/* Previous Button */}
      <button
        onClick={() => page > 1 && fetchClients(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &laquo;
      </button>
      
      {/* First Page */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => fetchClients(1)}
            className="px-3 py-1 border rounded-md"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      
      {/* Page Numbers */}
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => (
        <button
          key={startPage + i}
          onClick={() => fetchClients(startPage + i)}
          className={`px-3 py-1 border rounded-md ${page === startPage + i ? 'bg-blue-500 text-white' : ''}`}
        >
          {startPage + i}
        </button>
      ))}
      
      {/* Last Page */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => fetchClients(totalPages)}
            className="px-3 py-1 border rounded-md"
          >
            {totalPages}
          </button>
        </>
      )}
      
      {/* Next Button */}
      <button
        onClick={() => page < totalPages && fetchClients(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &raquo;
      </button>
    </div>
  );
};
  const handleDelete = async (id, fromNotification = false) => {
    setActionLoading(id)
    try {
      const res = await fetch(`${API_BASE_URL}/api/client/delete/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c._id !== id))
        if (fromNotification) {
          setTodayFollowUps((prev) => prev.filter((c) => c._id !== id))
        }
        setDeleteClient(null)
      }
    } catch (err) {
      console.error("Delete failed", err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditSubmit = async (e, fromNotification = false) => {
    e.preventDefault()
    setActionLoading(editClient._id)
    try {
      const res = await fetch(`${API_BASE_URL}/api/client/edit/${editClient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editClient),
      })
      if (res.ok) {
        const updated = await res.json()
        setClients((prev) => prev.map((c) => (c._id === editClient._id ? { ...c, ...editClient } : c)))
        if (fromNotification) {
          setTodayFollowUps((prev) => prev.map((c) => (c._id === editClient._id ? { ...c, ...editClient } : c)))
        }
        setEditClient(null)
      }
    } catch (err) {
      console.error("Update failed", err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleFollowUpSubmit = async (e, fromNotification = false) => {
    e.preventDefault()
    setActionLoading(followUpClient._id)
    try {
      const res = await fetch(`${API_BASE_URL}/api/client/followup/${followUpClient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(followUpData),
      })
      if (res.ok) {
        await fetchClients()
        setFollowUpClient(null)
        setFollowUpData({ remark: "", nextTaskDate: "" })
      }
    } catch (err) {
      console.error("Follow-up update failed", err)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredClients = clients.filter((client) => {
  const matchesSearch =
    (client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (client.phone?.includes(searchTerm) ?? false);

  const matchesStatus =
    statusFilter === "All" || client.status === statusFilter;

  const matchesHotLead =
    hotLeadFilter === "All" ||
    (hotLeadFilter === "Yes" && client.hotLead === true) ||
    (hotLeadFilter === "No" && client.hotLead === false);

  let matchesDate = true;
  switch (dateFilter) {
    case "today":
      matchesDate = isToday(client.nextTaskDate);
      break;
    case "overdue":
      matchesDate = isOverdue(client.nextTaskDate);
      break;
    case "thisWeek":
      matchesDate = isThisWeek(client.nextTaskDate);
      break;
    case "thisMonth":
      matchesDate = isThisMonth(client.nextTaskDate);
      break;
    default:
      matchesDate = true;
  }

  return matchesSearch && matchesStatus && matchesDate && matchesHotLead;
});


  const ClientRow = ({ client,index, fromNotification = false }) => (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {/* <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900">{index+1}</div>
          </div>
        </div>
      </td> */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div onClick={() => setSelectedClient(client)} className="ml-4">
            <div className="text-sm font-semibold cursor-pointer text-gray-900">{client.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          {client.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              {client.phone}
            </div>
          )}
          {client.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              {client.email}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[client.status]}`}
        >
          {client.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-xs text-gray-500">Lead:</span>
            <span className="ml-1">{formatDate(client.leadDated)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-xs text-gray-500">Follow-up:</span>
            <span
              className={`ml-1 ${isToday(client.nextTaskDate) ? "font-semibold text-orange-600" : isOverdue(client.nextTaskDate) ? "font-semibold text-red-600" : ""}`}
            >
              {formatDate(client.nextTaskDate)}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {client.lastRemark ? (
          <div className="max-w-xs">
            <div className="text-sm text-gray-900 truncate">{client.lastRemark}</div>
            <div className="text-xs text-gray-500">
              {client.interactions?.length ? formatDate(client.interactions.at(-1).date) : "-"}
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">No activity</span>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => setSelectedClient(client)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
            title="View Remarks"
          >
            <MessageSquareText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFollowUpClient(client)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-150"
            title="Add Follow-Up"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditClient(client)}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-150"
            title="Edit Client"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteClient(client)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
            title="Delete Client"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
  // Initial load and when filters change
// Initial load and when filters change
useEffect(() => {
  fetchClients(1); // Reset to first page when filters change
}, [searchTerm, statusFilter, hotLeadFilter, dateFilter]);

// Load more when page changes
// useEffect(() => {
//   if (page > 1) {
//     fetchClients(page);
//   }
// }, [page]);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Today's Follow-ups Notification Modal */}
      {showTodayNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-orange-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">Today's Follow-ups</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    You have {todayFollowUps.length} client{todayFollowUps.length !== 1 ? "s" : ""} to follow up with
                    today
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTodayNotification(false)}
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors duration-150"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Lead Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todayFollowUps.map((client,index) => (
                      <ClientRow index={index} key={client._id} client={client} fromNotification={true} />
                    ))}
                  </tbody>
                  

                </table>
              </div>
            </div>
            <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowTodayNotification(false)}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-150"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-0 sm:px-6">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
              <p className="mt-1 text-sm text-gray-500">Manage and track your client relationships</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Only show notification button if there are today's follow-ups */}
              {todayFollowUps.length > 0 && (
                <button
                  onClick={() => setShowTodayNotification(true)}
                  className="flex items-center bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors duration-150 relative"
                >
                  <Bell className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-700">
                    {todayFollowUps.length} Today's Follow-ups
                  </span>
                  {/* Notification badge */}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {todayFollowUps.length}
                  </span>
                </button>
              )}
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Total Leads: {totalLeads}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-0 px-2  py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search clients by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-40">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                  <select
                    value={hotLeadFilter}
                    onChange={(e) => setHotLeadFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
                  >
                    <option value="All">All Leads</option>
                    <option value="Yes">Hot</option>
                    <option value="No">Normal</option>
                  </select>
                </div>
              </div>
              <div className="w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
                  >
                    <option value="All">All Status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status} ({statusCountMap[status] ?? 0})
                      </option>
                    ))}

                  </select>
                </div>
              </div>
              <div className="w-48">
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
                  >
                    {dateFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.today}
              </div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.overdue}
              </div>
              <div className="text-xs text-gray-500">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {stats.thisWeek}
              </div>
              <div className="text-xs text-gray-500">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.pravasa}
              </div>
              <div className="text-xs text-gray-500">Pravasa Lead</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.hotLeads}
              </div>
              <div className="text-xs text-gray-500">Hot Lead</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Loading clients...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client,index) => (
                    <ClientRow index={index} key={client._id} client={client} />
                  ))}
                </tbody>
                
              </table>
              {totalPages > 1 && <PaginationControls />}

              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter !== "All" || dateFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by adding your first client."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Remarks Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Client Remarks</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedClient.name}</p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              {selectedClient.interactions?.length ? (
                <div className="space-y-4">
                  {selectedClient.interactions.map((interaction, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-900 mb-2">{interaction.remark}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(interaction.date)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquareText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No remarks yet</h3>
                  <p className="mt-1 text-sm text-gray-500">No interactions have been recorded for this client.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Client</h2>
                <p className="text-sm text-gray-500 mt-1">Update client information</p>
              </div>
              <button
                type="button"
                onClick={() => setEditClient(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={editClient.name || ""}
                    onChange={(e) => setEditClient({ ...editClient, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={editClient.phone || ""}
                    onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editClient.email || ""}
                    onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hot Lead
                  </label>
                  <select
                    value={editClient.hotLead ? "yes" : "no"}
                    onChange={(e) =>
                      setEditClient({ ...editClient, hotLead: e.target.value === "yes" })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>


                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editClient.status}
                    onChange={(e) => setEditClient({ ...editClient, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead Date</label>
                  <input
                    type="date"
                    value={formatInputDate(editClient.leadDated)}
                    onChange={(e) => setEditClient({ ...editClient, leadDated: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={formatInputDate(editClient.nextTaskDate)}
                    onChange={(e) => setEditClient({ ...editClient, nextTaskDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div> */}
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => setEditClient(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading === editClient._id}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading === editClient._id ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Client"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Follow-up Modal */}
      {followUpClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleFollowUpSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Follow-Up</h2>
                <p className="text-sm text-gray-500 mt-1">{followUpClient.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setFollowUpClient(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Next Follow-Up Date</label>
                <input
                  type="date"
                  value={followUpData.nextTaskDate}
                  onChange={(e) =>
                    setFollowUpData((prev) => ({
                      ...prev,
                      nextTaskDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remark</label>
                <textarea
                  value={followUpData.remark}
                  onChange={(e) =>
                    setFollowUpData((prev) => ({
                      ...prev,
                      remark: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows={4}
                  placeholder="Enter your follow-up notes..."
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => setFollowUpClient(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading === followUpClient._id}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading === followUpClient._id ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Follow-Up"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Modal */}
      {deleteClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Delete Client</h2>
              <p className="text-gray-500 text-center mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900">{deleteClient.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setDeleteClient(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteClient._id)}
                  disabled={actionLoading === deleteClient._id}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {actionLoading === deleteClient._id ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Client"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GetClients
