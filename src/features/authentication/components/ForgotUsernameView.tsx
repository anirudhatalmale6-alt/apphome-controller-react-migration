/**
 * ForgotUsernameView Component
 * Flow: Enter email -> API sends username to email -> Show success message
 * Migrated from AppHomeController.js forgotUserName function (line 1187)
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForgotUsernameMutation } from '../api/authenticationApi';
import { maskEmail } from '../../../lib/crypto';

type Step = 'email' | 'success';

export const ForgotUsernameView: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState('');

  const [forgotUsername, { isLoading }] = useForgotUsernameMutation();

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);

    try {
      const result = await forgotUsername({ forgetuserid: email }).unwrap();

      if (result[0]?.[0]?.result === 'Success') {
        setMaskedEmail(maskEmail(email));
        setStep('success');
      } else {
        setError('No account found with this email address.');
      }
    } catch {
      setError('Something went wrong. Please try again later.');
    }
  }, [email, forgotUsername]);

  // Email input step
  if (step === 'email') {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Left Panel - Branding */}
        <div className="w-1/2 bg-[#e2e2e2] flex flex-col">
          <div className="p-5">
            <span className="text-xl text-slate-500">
              <b className="text-[#4a4a4a]">optus</b> intelligence
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center -mt-20">
            <h2 className="text-2xl text-gray-500 mb-2">
              Automate with <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
            </h2>
            <p className="text-xl text-gray-500 mb-24">
              Steamline, Scale any business process
            </p>
            <div className="self-end mr-8">
              <button
                className="px-6 py-2 bg-[#9aaad1] text-white rounded hover:bg-[#8a9ac1] transition-colors"
                onClick={() => window.open('https://optusintelligence.com', '_blank')}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-1/2 bg-white flex flex-col">
          <div className="text-center mt-[5%] mb-[5%]">
            <span className="text-xl text-gray-500">Access </span>
            <span className="text-2xl text-gray-500">
              <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
            </span>
          </div>

          <div className="text-center mb-4">
            <span className="text-[#9aaad1] text-lg">Forgot Username</span>
          </div>

          <div className="px-8 max-w-md mx-auto w-full">
            <p className="text-sm text-slate-600 mb-6">
              Please enter your registered email address:
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full px-3 py-2 border-b border-dotted border-gray-300 focus:border-[#9aaad1] outline-none bg-transparent"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !email}
              className="w-full py-2 bg-[#9aaad1] text-white rounded hover:bg-[#8a9ac1] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-xs text-gray-600 underline hover:text-gray-800"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-1/2 p-4 text-xs text-gray-500">
          Copyright optusintelligence Inc &copy; {new Date().getFullYear()}
        </div>
      </div>
    );
  }

  // Success step
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="w-1/2 bg-[#e2e2e2] flex flex-col">
        <div className="p-5">
          <span className="text-xl text-slate-500">
            <b className="text-[#4a4a4a]">optus</b> intelligence
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <h2 className="text-2xl text-gray-500 mb-2">
            Automate with <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
          </h2>
          <p className="text-xl text-gray-500 mb-24">
            Steamline, Scale any business process
          </p>
          <div className="self-end mr-8">
            <button
              className="px-6 py-2 bg-[#9aaad1] text-white rounded hover:bg-[#8a9ac1] transition-colors"
              onClick={() => window.open('https://optusintelligence.com', '_blank')}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Success Message */}
      <div className="w-1/2 bg-white flex flex-col">
        <div className="text-center mt-[5%] mb-[5%]">
          <span className="text-xl text-gray-500">Access </span>
          <span className="text-2xl text-gray-500">
            <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
          </span>
        </div>

        <div className="text-center mb-4">
          <span className="text-[#9aaad1] text-lg">Username Sent</span>
        </div>

        <div className="px-8 max-w-md mx-auto w-full">
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-700 text-sm">
              Your User ID has been sent to your registered Email ID: <b>{maskedEmail}</b>
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-2 bg-[#9aaad1] text-white rounded hover:bg-[#8a9ac1] transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-1/2 p-4 text-xs text-gray-500">
        Copyright optusintelligence Inc &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default ForgotUsernameView;
