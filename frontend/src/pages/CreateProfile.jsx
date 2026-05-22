import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../api/client';

export default function CreateProfile() {
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [slogan, setSlogan] = useState('');
  const [projectsServices, setProjectsServices] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyName || !location || !projectsServices || !phone || !email) {
      setError('Company name, location, projects/services, phone, and email are required');
      return;
    }

    try {
      setLoading(true);
      await profileAPI.createProfile({ 
        companyName, 
        location, 
        workingHours, 
        slogan, 
        projectsServices, 
        phone, 
        email, 
        website 
      });
      navigate('/my-profiles');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-md">
      <h2>Create Business Profile</h2>
      
      {error && (
        <div className="message message-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Company Name *"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Location *"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Working Hours (e.g., Mon-Fri 9am-5pm)"
            value={workingHours}
            onChange={(e) => setWorkingHours(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Slogan (e.g., Quality You Can Trust)"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
          />
        </div>
        <div className="form-group">
          <textarea
            className="form-textarea"
            placeholder="Projects or Services *"
            value={projectsServices}
            onChange={(e) => setProjectsServices(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="tel"
            className="form-input"
            placeholder="Phone *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            className="form-input"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="url"
            className="form-input"
            placeholder="Website (optional)"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}