import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App'; 
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token'); // Or your auth token source
        const response = await axios.get(`${backendUrl}/api/order/dashboard`, {
          headers: { token }
        });
        
        setDashboardData({
          totalRevenue: response.data.data.totalRevenue,
          totalOrders: response.data.data.totalOrders,
          totalUsers: response.data.data.totalUsers,
          loading: false,
          error: null
        });
      } catch (error) {
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || 'Failed to fetch dashboard data'
        }));
        console.error('Dashboard error:', error);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };

  if (dashboardData.loading) {
    return (
      <div className="dashboard p-4">
        <h3 className="text-xl font-bold mb-4">Admin Dashboard</h3>
        <div className="text-center py-8">Loading dashboard data...</div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="dashboard p-4">
        <h3 className="text-xl font-bold mb-4">Admin Dashboard</h3>
        <div className="text-red-500 text-center py-8">{dashboardData.error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard p-4">
      <h3 className="text-xl font-bold mb-4">Admin Dashboard</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-500 p-4 text-white rounded-md text-center">
          <h4 className="font-medium">Total Users</h4>
          <p className="text-2xl font-bold">{dashboardData.totalUsers}</p>
        </div>
        <div className="bg-green-500 p-4 text-white rounded-md text-center">
          <h4 className="font-medium">Total Orders</h4>
          <p className="text-2xl font-bold">{dashboardData.totalOrders}</p>
        </div>
        <div className="bg-yellow-500 p-4 text-white rounded-md text-center">
          <h4 className="font-medium">Total Revenue</h4>
          <p className="text-2xl font-bold">{formatCurrency(dashboardData.totalRevenue)}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;