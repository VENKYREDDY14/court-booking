import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

function AdminPanel({ onBack }) {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('courts');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch data based on tab
    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            if (activeTab === 'rules') endpoint = '/api/admin/rules';
            else if (activeTab === 'bookings') endpoint = '/api/admin/bookings';
            else endpoint = '/api/resources'; // Reusing resource endpoint for list

            const API_URL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${API_URL}${endpoint}`);
            const result = await res.json();

            if (activeTab === 'courts') setData(result.courts || []);
            else if (activeTab === 'equipment') setData(result.equipment || []);
            else if (activeTab === 'coaches') setData(result.coaches || []);
            else setData(result);

        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleDelete = async (id, type) => {
        if (!confirm('Are you sure?')) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            let endpoint = `/api/admin/${type}/${id}`;
            await fetch(`${API_URL}${endpoint}`, { method: 'DELETE' });
            toast.success('Item deleted successfully');
            fetchData();
        } catch (e) { toast.error(e.message); }
    };

    const handleCreate = async (type, payload) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            let endpoint = `/api/admin/${type}`;
            await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            toast.success('Item created successfully');
            fetchData();
        } catch (e) { toast.error(e.message); }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                    <button
                        className="btn btn-secondary text-sm"
                        onClick={onBack}
                    >
                        ← Back to App
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {['bookings', 'courts', 'equipment', 'coaches', 'rules'].map(tab => (
                        <button
                            key={tab}
                            className={`
                                btn whitespace-nowrap px-4 py-2 capitalize transition-all rounded-full
                                ${activeTab === tab
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }
                            `}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6">
                            {activeTab === 'bookings' && <BookingsManager data={data} />}
                            {activeTab === 'courts' && <CourtsManager data={data} onCreate={p => handleCreate('courts', p)} onDelete={id => handleDelete(id, 'courts')} />}
                            {activeTab === 'equipment' && <EquipmentManager data={data} onCreate={p => handleCreate('equipment', p)} onDelete={id => handleDelete(id, 'equipment')} />}
                            {activeTab === 'coaches' && <CoachManager data={data} onCreate={p => handleCreate('coaches', p)} onDelete={id => handleDelete(id, 'coaches')} />}
                            {activeTab === 'rules' && <RulesManager data={data} onCreate={p => handleCreate('rules', p)} onDelete={id => handleDelete(id, 'rules')} />}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Sub-components

const CourtsManager = ({ data, onCreate, onDelete }) => {
    const [form, setForm] = useState({ name: '', type: 'INDOOR', basePrice: 100 });
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Manage Courts</h3>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Court Name</label>
                        <input placeholder="e.g. Center Court" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Type</label>
                        <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option value="INDOOR">Indoor</option>
                            <option value="OUTDOOR">Outdoor</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Hourly Price ($)</label>
                        <input type="number" placeholder="100" className="input" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} />
                    </div>
                    <div className="flex items-end">
                        <button className="btn btn-primary w-full" onClick={() => onCreate(form)}>+ Add Court</button>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price/Hr</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {data.map(item => (
                            <tr key={item._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === 'INDOOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${item.basePrice}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onDelete(item._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const EquipmentManager = ({ data, onCreate, onDelete }) => {
    const [form, setForm] = useState({ name: '', type: 'RACKET', price: 10, quantity: 10 });
    return (
        <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Manage Equipment</h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Item Name</label>
                        <input placeholder="Name" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Price</label>
                        <input className="input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Quantity</label>
                        <input className="input" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                        <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option value="RACKET">Racket</option>
                            <option value="SHOES">Shoes</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button className="btn btn-primary" onClick={() => onCreate(form)}>+ Add Equipment</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map(item => (
                    <div key={item._id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 flex justify-between items-center group">
                        <div>
                            <div className="font-medium text-slate-900">{item.name}</div>
                            <div className="text-sm text-slate-500">${item.price} • {item.quantity} in stock</div>
                        </div>
                        <button onClick={() => onDelete(item._id)} className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-2">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CoachManager = ({ data, onCreate, onDelete }) => {
    const [form, setForm] = useState({ name: '', hourlyRate: 50 });
    return (
        <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Manage Coaches</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Coach Name</label>
                        <input placeholder="Name" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Hourly Rate</label>
                        <input placeholder="Rate" className="input" type="number" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} />
                    </div>
                    <button className="btn btn-primary" onClick={() => onCreate(form)}>Add Coach</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map(item => (
                    <div key={item._id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                {item.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-medium text-slate-900">{item.name}</div>
                                <div className="text-sm text-slate-500">${item.hourlyRate}/hr</div>
                            </div>
                        </div>
                        <button onClick={() => onDelete(item._id)} className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-2">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RulesManager = ({ data, onCreate, onDelete }) => {
    const [form, setForm] = useState({
        name: '',
        type: 'PEAK_HOUR',
        value: 1.5,
        adjustmentType: 'MULTIPLIER',
        startTime: '18:00',
        endTime: '21:00',
        days: ''
    });

    const handleSubmit = () => {
        const payload = {
            name: form.name,
            type: form.type,
            value: Number(form.value),
            adjustmentType: form.adjustmentType,
            conditions: {}
        };

        if (form.type === 'PEAK_HOUR') {
            payload.conditions = { startTime: form.startTime, endTime: form.endTime };
        } else if (form.type === 'WEEKEND') {
            payload.conditions = { days: [0, 6] };
        }

        onCreate(payload);
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Pricing Rules</h3>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                <h4 className="font-semibold mb-4 text-slate-800">Add New Pricing Rule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Rule Name</label>
                        <input placeholder="e.g. Evening Peak" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Rule Type</label>
                        <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option value="PEAK_HOUR">Peak Hours</option>
                            <option value="WEEKEND">Weekend</option>
                        </select>
                    </div>
                </div>

                {form.type === 'PEAK_HOUR' && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Start Time</label>
                            <input type="time" className="input" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">End Time</label>
                            <input type="time" className="input" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Multiplier Value</label>
                        <input type="number" placeholder="1.5" className="input" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                    </div>
                    <button className="btn btn-primary" onClick={handleSubmit}>Create Rule</button>
                </div>
            </div>

            <div className="space-y-3">
                {data.map(item => (
                    <div key={item._id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div>
                            <div className="flex items-center gap-2">
                                <strong className="text-slate-900">{item.name}</strong>
                                <span className="badge bg-indigo-50 text-indigo-700">{item.type}</span>
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                                {item.adjustmentType}: <span className="font-medium text-slate-900">{item.value}x</span>
                            </div>
                        </div>
                        <button onClick={() => onDelete(item._id)} className="btn btn-secondary text-red-600 border-red-200 hover:bg-red-50 text-xs py-1.5">Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BookingsManager = ({ data }) => {
    return (
        <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">All Booking History</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Court</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {data.map(b => (
                            <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{b.user ? (b.user.name || 'Guest') : 'Guest'}</div>
                                    <div className="text-xs text-slate-500">{b.user?.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{b.court?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(b.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{b.startTime} - {b.endTime}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${b.totalPrice}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {b.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
