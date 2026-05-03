import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, QrCode, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await register(formData.fullName, formData.email, formData.password, formData.confirmPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md mx-auto"
      >
        <Card variant="elevated" padding="lg" className="sm:shadow-xl">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-2xl mb-4">
              <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-600">
              Create Account
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Join QR Generator Platform</p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              variants={itemVariants}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              {error}
            </motion.div>
          )}

          {/* Registration form */}
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              name="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              icon={User}
              value={formData.fullName}
              onChange={handleChange}
              error={error && !formData.fullName ? 'Full name is required' : ''}
              required
            />

            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={error && !formData.email ? 'Email is required' : ''}
              required
            />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Create a password"
              icon={Lock}
              showPasswordToggle
              value={formData.password}
              onChange={handleChange}
              error={error && !formData.password ? 'Password is required' : ''}
              helperText="Must be at least 6 characters"
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              icon={Lock}
              showPasswordToggle
              value={formData.confirmPassword}
              onChange={handleChange}
              error={error && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              className="w-full"
              icon={ArrowRight}
              iconPosition="right"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </motion.form>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </motion.div>

          {/* Features highlight */}
          <motion.div variants={itemVariants} className="mt-8 space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
              Create unlimited QR codes
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
              Advanced analytics dashboard
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
              Mobile-optimized business cards
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
