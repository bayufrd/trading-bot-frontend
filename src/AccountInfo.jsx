import React, { useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AccountInfo = () => {
    const [accountInfo, setAccountInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAccountInfo();
    }, []);

    const fetchAccountInfo = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/account`);
            const data = await response.json();
            if (data.success) {
                setAccountInfo(data.accountInfo);
            } else {
                setMessage('Error fetching account info');
            }
        } catch (error) {
            setMessage('Error fetching account info');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-800 text-white p-6">
            <h1 className="text-3xl font-bold mb-4">Account Information</h1>
            {message && <div className="mb-4 text-red-400">{message}</div>}
            {accountInfo ? (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Account Details</h2>
                    <pre>{JSON.stringify(accountInfo, null, 2)}</pre>
                </div>
            ) : (
                <div>No account info available.</div>
            )}
        </div>
    );
};

export default AccountInfo;