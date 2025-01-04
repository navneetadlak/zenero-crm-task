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
    Select,
    MenuItem,
    Card,
    CardContent,
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
                const response = await axios.get('http://localhost:5000/crm-data');
                setData(response.data);
                setFilteredData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
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
                backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)'],
                borderColor: ['#4CAF50', '#F44336'],
                borderWidth: 2,
            },
        ],
    };

    return (
        <div style={{ padding: 20 }}>
            <Typography variant="h4" gutterBottom align="center">
                CRM Dashboard
            </Typography>

            {/* Filters Section */}
            <Card style={{ marginBottom: 20 }}>
                <CardContent>
                    <Typography variant="h6">Filters</Typography>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: 10 }}>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            displayEmpty
                            variant="outlined"
                            style={{ minWidth: 150 }}
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>

                        <div style={{ flexGrow: 1 }}>
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
                        </div>
                        <Button variant="contained" color="primary" onClick={filterData}>
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Section */}
            <Card style={{ marginBottom: 20 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Summary
                    </Typography>
                    <Typography>Total Clients: {totalClients}</Typography>
                    <Typography>Total Opportunity Value for Active Clients: {totalOpportunityValue}</Typography>
                </CardContent>
            </Card>

            {/* Chart Section */}
            <Card style={{ marginBottom: 20 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Client Status Distribution
                    </Typography>
                    <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </CardContent>
            </Card>

            {/* Table Section */}
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
                            <TableRow key={row.id} hover>
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
