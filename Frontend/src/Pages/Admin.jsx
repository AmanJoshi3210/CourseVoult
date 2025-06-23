import React, { useState } from 'react';
import axios from 'axios';

const PendingResources = () => {
    const [resources, setResources] = useState([]);
    const [error, setError] = useState('');
    const [secret, setSecret] = useState('');
    const [fetched, setFetched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({}); // Track action loading per item

    const removeResource = async (id) => {
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await axios.delete(`http://localhost:6800/api/v1/delete/${id}`, {
                headers: {
                    SecretPass: secret
                }
            });

            // Refetch after deletion
            fetchResources();
        } catch (err) {
            console.error('Error deleting resource:', err);
            setError('Failed to delete resource');
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };


    const fetchResources = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:6800/api/v1/admin', {
                headers: {
                    SecretPass: secret
                }
            });

            setResources(response.data);
            setFetched(true);
            setError('');
        } catch (err) {
            setError('Access denied or error occurred');
            setResources([]);
            setFetched(true);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
        await axios.post(`http://localhost:6800/api/v1/AddPendingToProduct/${id}`, 
            {}, // No request body, so empty object here
            {
                headers: {
                    SecretPass: secret
                }
            }
        );

        // Refetch after action
        fetchResources();
    } catch (err) {
        console.error('Error updating status:', err);
        setError('Failed to update resource status');
    } finally {
        setActionLoading(prev => ({ ...prev, [id]: false }));
    }
};


    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-100 p-6">
            <h1 className="text-3xl font-extrabold text-center text-gray-700 mb-6">📦 Admin Pending Resources Panel</h1>

            <div className="flex justify-center mb-6">
                <input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter SecretPass"
                    className="border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                />

                <button
                    onClick={fetchResources}
                    className="bg-purple-500 text-white px-4 py-2 rounded-r hover:bg-purple-600 transition"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Fetch Resources'}
                </button>
            </div>

            {fetched && error && (
                <p className="text-center text-red-500 font-medium mb-4">{error}</p>
            )}

            {resources.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                        <div
                            key={resource._id}
                            className="bg-white shadow-lg rounded-xl p-4 transform hover:scale-105 transition duration-300 ease-in-out"
                        >
                            <h2 className="text-xl font-semibold mb-2 text-purple-600">{resource.name}</h2>
                            <p className="text-gray-700"><strong>Description:</strong> {resource.description}</p>
                            <p className="text-gray-700"><strong>Category:</strong> {resource.category}</p>
                            <p className="text-gray-700"><strong>Type:</strong> {resource.type}</p>
                            <p className="text-gray-700">
                                <strong>Link:</strong>{" "}
                                <a
                                    href={resource.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    View Resource
                                </a>
                            </p>
                            <p className="text-gray-700"><strong>Submitted By:</strong> {resource.submittedBy}</p>
                            <p className="text-gray-700 mb-2"><strong>Status:</strong> {resource.status}</p>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => updateStatus(resource._id, 'approved')}
                                    className={`flex-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition ${actionLoading[resource._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={actionLoading[resource._id]}
                                >
                                    {actionLoading[resource._id] ? 'Processing...' : '✅ Accept'}
                                </button>
                                <button
                                    onClick={() => removeResource(resource._id)}
                                    className={`flex-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition ${actionLoading[resource._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={actionLoading[resource._id]}
                                >
                                    {actionLoading[resource._id] ? 'Removing...' : '❌ Remove'}
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && fetched && resources.length === 0 && !error && (
                <p className="text-center text-gray-500 mt-6">No pending resources found.</p>
            )}
        </div>
    );
};

export default PendingResources;
