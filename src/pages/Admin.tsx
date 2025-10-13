import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAdmin } from '../context/AdminContext';
import { Plus, Edit2, Trash2, X, Save, LogOut, Upload, Search } from 'lucide-react';

interface Case {
  id: string;
  case_number: string;
  status: string;
  full_name: string;
  id_number: string;
  email: string;
  phone_number: string;
  date_of_birth: string | null;
  country: string;
  total_retrieved_amount: number;
  transaction_id: string | null;
  platform: string | null;
  payment_required: number;
  pdf_file_name: string | null;
  pdf_file_url: string | null;
  pdf_uploaded_at: string | null;
}

interface CaseForm {
  case_number: string;
  status: string;
  full_name: string;
  id_number: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  country: string;
  total_retrieved_amount: string;
  transaction_id: string;
  platform: string;
  payment_required: string;
}

const emptyForm: CaseForm = {
  case_number: '',
  status: 'Pending',
  full_name: '',
  id_number: '',
  email: '',
  phone_number: '',
  date_of_birth: '',
  country: '',
  total_retrieved_amount: '0',
  transaction_id: '',
  platform: '',
  payment_required: '0',
};

function Admin() {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const [cases, setCases] = useState<Case[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [formData, setFormData] = useState<CaseForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (err) {
      setError('Failed to fetch cases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (caseData?: Case) => {
    if (caseData) {
      setEditingCase(caseData);
      setFormData({
        case_number: caseData.case_number,
        status: caseData.status,
        full_name: caseData.full_name,
        id_number: caseData.id_number,
        email: caseData.email,
        phone_number: caseData.phone_number,
        date_of_birth: caseData.date_of_birth || '',
        country: caseData.country,
        total_retrieved_amount: caseData.total_retrieved_amount.toString(),
        transaction_id: caseData.transaction_id || '',
        platform: caseData.platform || '',
        payment_required: caseData.payment_required.toString(),
      });
    } else {
      setEditingCase(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCase(null);
    setFormData(emptyForm);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const caseData = {
        case_number: formData.case_number,
        status: formData.status,
        full_name: formData.full_name,
        id_number: formData.id_number,
        email: formData.email,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth || null,
        country: formData.country,
        total_retrieved_amount: parseFloat(formData.total_retrieved_amount) || 0,
        transaction_id: formData.transaction_id || null,
        platform: formData.platform || null,
        payment_required: parseFloat(formData.payment_required) || 0,
      };

      if (editingCase) {
        const { error } = await supabase
          .from('cases')
          .update(caseData)
          .eq('id', editingCase.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cases')
          .insert([caseData]);

        if (error) throw error;
      }

      await fetchCases();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save case');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case?')) return;

    try {
      const caseToDelete = cases.find(c => c.id === id);

      if (caseToDelete?.pdf_file_url) {
        const fileName = caseToDelete.pdf_file_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('case-pdfs')
            .remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCases();
    } catch (err) {
      setError('Failed to delete case');
      console.error(err);
    }
  };

  const handlePdfUpload = async (caseId: string, file: File) => {
    try {
      setUploadingPdf(caseId);
      setError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${caseId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('case-pdfs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('case-pdfs')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('cases')
        .update({
          pdf_file_name: file.name,
          pdf_file_url: publicUrl,
          pdf_uploaded_at: new Date().toISOString(),
        })
        .eq('id', caseId);

      if (updateError) throw updateError;

      await fetchCases();
    } catch (err: any) {
      setError(err.message || 'Failed to upload PDF');
      console.error(err);
    } finally {
      setUploadingPdf(null);
    }
  };

  const statusOptions = ['Active', 'Blocked', 'Pending', 'On Hold', 'Received'];

  const filteredCases = cases.filter(caseItem =>
    searchQuery === '' ||
    caseItem.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.phone_number.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by case number, name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-2 border-gray-300 focus:border-green-600 focus:outline-none pl-10 pr-4 py-3 rounded-lg text-gray-700 w-96"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Case
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {error && !isModalOpen && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading cases...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Case Number</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Retrieved Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PDF</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        {searchQuery ? 'No cases match your search.' : 'No cases found. Add your first case to get started.'}
                      </td>
                    </tr>
                  ) : (
                    filteredCases.map((caseItem) => (
                      <tr key={caseItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{caseItem.case_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            caseItem.status === 'Active' ? 'bg-green-100 text-green-800' :
                            caseItem.status === 'Blocked' ? 'bg-red-100 text-red-800' :
                            caseItem.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {caseItem.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{caseItem.full_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{caseItem.country}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">${caseItem.total_retrieved_amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {caseItem.pdf_file_name ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-green-600 font-medium">Uploaded</span>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePdfUpload(caseItem.id, file);
                                }}
                                disabled={uploadingPdf === caseItem.id}
                              />
                              <span className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
                                <Upload className="w-4 h-4" />
                                {uploadingPdf === caseItem.id ? 'Uploading...' : 'Upload'}
                              </span>
                            </label>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenModal(caseItem)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(caseItem.id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingCase ? 'Edit Case' : 'Add New Case'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="case_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Case Number *
                  </label>
                  <input
                    type="text"
                    id="case_number"
                    name="case_number"
                    required
                    value={formData.case_number}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    id="id_number"
                    name="id_number"
                    required
                    value={formData.id_number}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    required
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="total_retrieved_amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Retrieved Amount
                  </label>
                  <input
                    type="number"
                    id="total_retrieved_amount"
                    name="total_retrieved_amount"
                    step="0.01"
                    value={formData.total_retrieved_amount}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="payment_required" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Required
                  </label>
                  <input
                    type="text"
                    id="payment_required"
                    name="payment_required"
                    value={formData.payment_required}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    id="transaction_id"
                    name="transaction_id"
                    value={formData.transaction_id}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <input
                    type="text"
                    id="platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 focus:border-green-600 focus:outline-none px-4 py-2 rounded-lg text-gray-700"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingCase ? 'Update Case' : 'Create Case'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
