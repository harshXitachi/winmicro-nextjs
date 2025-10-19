'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const CATEGORIES = [
  'Social Media',
  'Content Creation',
  'Data Research',
  'Data Entry',
  'Graphic Design',
  'Video Editing',
  'Translation',
  'Customer Support',
  'Testing & QA',
  'Other',
];

export default function CreateCampaign() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    type: 'ongoing',
    group_chat_enabled: true,
    
    // Step 2
    category: '',
    required_skills: [] as string[],
    description: '',
    target_workers: 10,
    visibility: 'public',
    
    // Step 3
    payment_model: 'fixed',
    base_payment: '',
    currency: 'INR',
    initial_deposit: '',
  });

  const [skillInput, setSkillInput] = useState('');

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.required_skills.includes(skillInput.trim())) {
      updateFormData('required_skills', [...formData.required_skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    updateFormData('required_skills', formData.required_skills.filter(s => s !== skill));
  };

  const calculateRequiredDeposit = () => {
    const basePayment = parseFloat(formData.base_payment) || 0;
    const targetWorkers = formData.target_workers || 0;
    return (basePayment * targetWorkers * 1.02).toFixed(2); // Include 2% platform fee
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.category && formData.description.trim().length > 0 && formData.target_workers > 0;
      case 3:
        return formData.base_payment && parseFloat(formData.base_payment) > 0;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          base_payment: parseFloat(formData.base_payment),
          initial_deposit: parseFloat(formData.initial_deposit) || 0,
        }),
      });

      if (response.ok) {
        const { campaign } = await response.json();
        router.push(`/campaigns/employer/campaign/${campaign.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="ri-add-circle-line text-3xl text-indigo-600"></i>
              <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
            </div>
            <button
              onClick={() => router.push('/campaigns/employer/dashboard')}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <i className="ri-close-line"></i>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  <span
                    className={`ml-3 text-sm font-medium ${
                      currentStep >= step ? 'text-indigo-600' : 'text-gray-500'
                    }`}
                  >
                    {step === 1 && 'Fundamentals'}
                    {step === 2 && 'Details'}
                    {step === 3 && 'Budget'}
                    {step === 4 && 'Review'}
                  </span>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Step 1: Fundamentals */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Fundamentals</h2>
                <p className="text-gray-600">Let's start with the basics of your campaign</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="e.g., Q4 Social Media Blast"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Campaign Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => updateFormData('type', 'one-off')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.type === 'one-off'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-checkbox-circle-line text-2xl text-indigo-600 mb-2"></i>
                    <h3 className="font-semibold text-gray-900">One-Off Task</h3>
                    <p className="text-sm text-gray-600">Each worker completes the task once</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData('type', 'ongoing')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.type === 'ongoing'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-loop-left-line text-2xl text-indigo-600 mb-2"></i>
                    <h3 className="font-semibold text-gray-900">Ongoing Project</h3>
                    <p className="text-sm text-gray-600">Workers can contribute continuously</p>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <i className="ri-message-3-line text-2xl text-blue-600 mr-3 mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-blue-900">Enable Group Chat</h4>
                    <p className="text-sm text-blue-800">Create a collaborative space for all workers</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateFormData('group_chat_enabled', !formData.group_chat_enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.group_chat_enabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.group_chat_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Task & Team Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Task & Team Details</h2>
                <p className="text-gray-600">Tell workers what you need</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.required_skills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-indigo-900"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Instructions *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe what workers need to do..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Number of Workers *
                  </label>
                  <input
                    type="number"
                    value={formData.target_workers}
                    onChange={(e) => updateFormData('target_workers', parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility *
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => updateFormData('visibility', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private (Invite Only)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Compensation & Budget */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Compensation & Budget</h2>
                <p className="text-gray-600">Set payment terms for your campaign</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Model *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => updateFormData('payment_model', 'fixed')}
                    className={`p-4 border-2 rounded-lg text-left ${
                      formData.payment_model === 'fixed'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">Fixed per Task</h3>
                    <p className="text-sm text-gray-600">Standard payment for each task</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData('payment_model', 'milestone')}
                    className={`p-4 border-2 rounded-lg text-left ${
                      formData.payment_model === 'milestone'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">Milestone-Based</h3>
                    <p className="text-sm text-gray-600">Pay for specific milestones</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Payment per Worker *
                  </label>
                  <input
                    type="number"
                    value={formData.base_payment}
                    onChange={(e) => updateFormData('base_payment', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => updateFormData('currency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Budget Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Payment × Workers:</span>
                    <span className="font-medium">{formData.currency} {((parseFloat(formData.base_payment) || 0) * formData.target_workers).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (2%):</span>
                    <span className="font-medium">{formData.currency} {((parseFloat(formData.base_payment) || 0) * formData.target_workers * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold text-gray-900">Required Deposit:</span>
                    <span className="font-bold text-indigo-600">{formData.currency} {calculateRequiredDeposit()}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Deposit (Optional)
                </label>
                <input
                  type="number"
                  value={formData.initial_deposit}
                  onChange={(e) => updateFormData('initial_deposit', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">You can add funds to escrow later</p>
              </div>
            </div>
          )}

          {/* Step 4: Review & Launch */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Launch</h2>
                <p className="text-gray-600">Confirm your campaign details</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">Campaign Fundamentals</h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-indigo-600 text-sm hover:text-indigo-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Name:</span> <span className="font-medium">{formData.name}</span></div>
                    <div><span className="text-gray-600">Type:</span> <span className="font-medium">{formData.type}</span></div>
                    <div><span className="text-gray-600">Group Chat:</span> <span className="font-medium">{formData.group_chat_enabled ? 'Enabled' : 'Disabled'}</span></div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">Task Details</h3>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-indigo-600 text-sm hover:text-indigo-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Category:</span> <span className="font-medium">{formData.category}</span></div>
                    <div><span className="text-gray-600">Target Workers:</span> <span className="font-medium">{formData.target_workers}</span></div>
                    <div><span className="text-gray-600">Visibility:</span> <span className="font-medium">{formData.visibility}</span></div>
                    {formData.required_skills.length > 0 && (
                      <div><span className="text-gray-600">Skills:</span> <span className="font-medium">{formData.required_skills.join(', ')}</span></div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">Payment</h3>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-indigo-600 text-sm hover:text-indigo-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Model:</span> <span className="font-medium">{formData.payment_model}</span></div>
                    <div><span className="text-gray-600">Base Payment:</span> <span className="font-medium">{formData.currency} {formData.base_payment}</span></div>
                    <div><span className="text-gray-600">Total Budget:</span> <span className="font-medium">{formData.currency} {calculateRequiredDeposit()}</span></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <i className="ri-information-line text-2xl text-blue-600 mr-3 mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Ready to Launch</h4>
                    <p className="text-sm text-blue-800">
                      Once launched, your campaign will be visible to workers. You can manage it from your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <i className="ri-arrow-left-line"></i>
                <span>Previous</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canGoNext()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <i className="ri-arrow-right-line"></i>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-rocket-line"></i>
                    <span>Launch Campaign</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
