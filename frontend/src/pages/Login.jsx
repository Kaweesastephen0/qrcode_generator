import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, QrCode, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl mb-4">
              <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
              QR Generator
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Business Card & Analytics Platform</p>
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

          {/* Login form */}
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error && !email ? 'Email is required' : ''}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              icon={Lock}
              showPasswordToggle
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error && !password ? 'Password is required' : ''}
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
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </motion.form>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Create Account
              </Link>
            </p>
          </motion.div>

          {/* Demo credentials hint */}
          <motion.div variants={itemVariants} className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Demo Account</p>
                <p className="text-sm text-blue-700 mt-1">admin@qrcode.com / password123</p>
              </div>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
