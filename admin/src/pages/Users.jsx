import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState({});
  const [loadingOrders, setLoadingOrders] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState(null); // State to track expanded user

  // Fetch all users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
    setLoadingUsers(false);
  };

  // Toggle block/unblock user
  const toggleBlockUser = async (userId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/block`,
        { userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
      );
      toast.success(response.data.message);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  // Fetch orders for a specific user
  const fetchUserOrders = async (userId) => {
    // Toggle collapse if already expanded
    if (expandedUserId === userId) {
        setExpandedUserId(null);
        return;
    }

    setLoadingOrders((prev) => ({ ...prev, [userId]: true }));
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/orders/${userId}`);

        if (!response.data.orders || response.data.orders.length === 0) {
          toast.info("No orders found for this user"); // Show info toast when no orders
          setOrders((prev) => ({ ...prev, [userId]: [] })); // Prevent undefined error
      } else {
          setOrders((prev) => ({ ...prev, [userId]: response.data.orders }));
          setExpandedUserId(userId); // Expand only if orders exist
      }
    } catch (error) {
      console.error("Error fetching orders:", error);

      // If error is 404 (not found), treat it as "no orders"
      if (error.response?.status === 404) {
          toast.info("No orders found for this user");
          setOrders((prev) => ({ ...prev, [userId]: [] })); // Handle UI correctly
      } else {
          toast.error(error.response?.data?.message || "Failed to fetch orders");
      }
  }

  setLoadingOrders((prev) => ({ ...prev, [userId]: false }));
};


  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>

      {loadingUsers ? (
        <p>Loading users...</p>
      ) : (
        <div className="bg-white p-4 shadow-md rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
                <th className="p-2 border">Orders</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border">
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.isBlocked ? "Blocked" : "Active"}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => toggleBlockUser(user._id)}
                      className={`px-2 py-1 text-white rounded ${
                        user.isBlocked ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => fetchUserOrders(user._id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      {expandedUserId === user._id ? "Hide Orders" : "View Orders"}
                    </button>
                    {expandedUserId === user._id && (
                      <div className="mt-2">
                        {loadingOrders[user._id] ? (
                          <p>Loading...</p>
                        ) : orders[user._id]?.length ? (
                          <ul className="mt-1 text-sm">
                            {orders[user._id].map((order) => (
                              <li key={order._id} className="border p-2 mt-1">
                                <p><strong>Order ID:</strong> {order._id}</p>
                                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p><strong>Amount:</strong> ₹{order.amount}</p>
                                <p><strong>Payment:</strong> {order.payment ? "Paid ✅" : "Pending ❌"}</p>
                                <p><strong>Status:</strong> {order.status}</p>
                                <p><strong>Address:</strong> {order.address.city}, {order.address.state}</p>
                                <h4 className="mt-2 font-semibold">Items:</h4>
                                <ul className="list-disc pl-5">
                                  {order.items.map((item, index) => (
                                    <li key={index}>{item.name} (x{item.quantity})</li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No orders found.</p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
