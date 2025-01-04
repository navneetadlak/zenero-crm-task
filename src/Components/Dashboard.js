// src/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Slider,
    Button,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registering the required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(100000);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/crm-data'); // Correct API endpoint
                setData(response.data);
                setFilteredData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        filterData();
    }, [statusFilter, minValue, maxValue]);

    const filterData = () => {
        let filtered = data;

        if (statusFilter !== 'All') {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        filtered = filtered.filter(item =>
            item.opportunityValue >= minValue && item.opportunityValue <= maxValue
        );

        setFilteredData(filtered);
    };

    const totalClients = filteredData.length;
    const totalOpportunityValue = filteredData.reduce((acc, item) => acc + item.opportunityValue, 0);

    const activeCount = filteredData.filter(item => item.status === 'Active').length;
    const inactiveCount = filteredData.filter(item => item.status === 'Inactive').length;

    const chartData = {
        labels: ['Active', 'Inactive'],
        datasets: [
            {
                label: 'Number of Clients',
                data: [activeCount, inactiveCount],
                backgroundColor: ['#4CAF50', '#F44336'],
            },
        ],
    };

    return (
        <div style={{ padding: 20 }}>
            <Typography variant="h4" gutterBottom>
                CRM Dashboard
            </Typography>
            
            <div style={{ marginBottom: 20 }}>
                <Typography variant="h6">Filters</Typography>
                <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

                <Typography gutterBottom>Opportunity Value Range</Typography>
                <Slider
                    value={[minValue, maxValue]}
                    onChange={(e, newValue) => {
                        setMinValue(newValue[0]);
                        setMaxValue(newValue[1]);
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100000}
                />
                
                <Button variant="contained" onClick={filterData}>Apply Filters</Button>
            </div>

            <Typography variant="h6">Summary</Typography>
            <Typography>Total Clients: {totalClients}</Typography>
            <Typography>Total Opportunity Value for Active Clients: {totalOpportunityValue}</Typography>

            <Bar data={chartData} />

            <TableContainer component={Paper} style={{ marginTop: 20 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Opportunity Value</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.email}</TableCell>
                                <TableCell>{row.opportunityValue}</TableCell>
                                <TableCell>{row.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Dashboard;
