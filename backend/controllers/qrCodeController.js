import QRCode from '../models/QRCode.js';
import BusinessProfile from '../models/BusinessProfile.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import QRCodeLib from 'qrcode';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

// Get all QR codes for current user
export const getUserQRCodes = asyncHandler(async (req, res) => {
  const qrCodes = await QRCode.find({ userId: req.user.userId })
    .populate('profileId', 'fullName companyName')
    .sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      qrCodes,
      count: qrCodes.length,
    },
  });
});

// Get QR code by profile ID
export const getQRCodeByProfile = asyncHandler(async (req, res) => {
  const qrCode = await QRCode.findOne({ profileId: req.params.profileId });

  if (!qrCode) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.QRCODE_NOT_FOUND,
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { qrCode },
  });
});

// Regenerate QR code
export const regenerateQRCode = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  const profile = await BusinessProfile.findById(profileId);

  if (!profile) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.PROFILE_NOT_FOUND,
    });
  }

  // Check ownership
  if (profile.userId.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.FORBIDDEN,
    });
  }

  // Generate new QR code
  const qrLink = `${process.env.DOMAIN_URL}/card/${profile._id}`;
  const qrCodeData = await QRCodeLib.toDataURL(qrLink);

  // Update or create QR code
  let qrCode = await QRCode.findOne({ profileId });

  if (qrCode) {
    qrCode.qrCodeUrl = qrCodeData;
    qrCode.qrCodeData = qrLink;
    await qrCode.save();
  } else {
    qrCode = new QRCode({
      profileId: profile._id,
      userId: req.user.userId,
      qrCodeData: qrLink,
      qrCodeUrl: qrCodeData,
      totalScans: 0,
    });
    await qrCode.save();
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'QR Code regenerated successfully',
    data: { qrCode },
  });
});

// Download QR code as image
export const downloadQRCode = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  const qrCode = await QRCode.findOne({ profileId });

  if (!qrCode) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.QRCODE_NOT_FOUND,
    });
  }

  // Generate PNG buffer
  try {
    const profile = await BusinessProfile.findById(profileId);
    const pngBuffer = await QRCodeLib.toBuffer(qrCode.qrCodeData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-code-${profile.fullName}.png"`);
    res.send(pngBuffer);
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      message: 'Error generating QR code image',
    });
  }
});

// Download complete business card as PNG
export const downloadBusinessCard = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const { variant = 'modern' } = req.query;

  const profile = await BusinessProfile.findById(profileId);
  const qrCode = await QRCode.findOne({ profileId });

  if (!profile || !qrCode) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Profile or QR code not found',
    });
  }

  try {
    // Define card styles matching frontend BusinessCard component
    const cardStyles = {
      modern: {
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        textColor: 'white',
        accentColor: '#fbbf24'
      },
      professional: {
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        textColor: 'white',
        accentColor: '#3b82f6'
      },
      minimal: {
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        textColor: '#1e293b',
        accentColor: '#3b82f6'
      }
    };

    const style = cardStyles[variant] || cardStyles.modern;

    // Handle profile photo - convert to base64 to avoid CORS issues
    let profilePhotoBase64 = null;
    if (profile.profilePhoto) {
      try {
        let photoPath;
        if (profile.profilePhoto.startsWith('http')) {
          // For external URLs, we'll use the URL directly
          profilePhotoBase64 = profile.profilePhoto;
        } else {
          // For local files, convert to base64
          photoPath = path.join(process.cwd(), 'uploads', 'profiles', profile.profilePhoto);
          const imageBuffer = await fs.readFile(photoPath);
          const ext = path.extname(photoPath).toLowerCase();
          const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
          profilePhotoBase64 = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        }
      } catch (photoError) {
        console.log('Could not load profile photo, will use fallback:', photoError.message);
        profilePhotoBase64 = null;
      }
    }

    // Convert QR code data URL to base64 if needed
    let qrCodeImageData = qrCode.qrCodeUrl;
    if (qrCode.qrCodeUrl && qrCode.qrCodeUrl.startsWith('data:image/png;base64,')) {
      qrCodeImageData = qrCode.qrCodeUrl;
    } else if (qrCode.qrCodeData) {
      // Generate QR code as base64 data URL
      qrCodeImageData = await QRCodeLib.toDataURL(qrCode.qrCodeData);
    }

    // Generate comprehensive HTML business card with all profile details
    const htmlCard = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Card - ${profile.fullName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .card {
            background: ${style.background};
            color: ${style.textColor};
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 900px;
            max-width: 100%;
            position: relative;
            overflow: hidden;
        }
        .card::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }
        .card-content {
            position: relative;
            z-index: 1;
            display: flex;
            gap: 30px;
            align-items: flex-start;
        }
        .profile-section {
            flex: 1;
        }
        .name {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 8px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .title {
            font-size: 22px;
            color: ${style.accentColor};
            margin-bottom: 4px;
        }
        .company {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        .description {
            margin: 20px 0;
            font-size: 14px;
            line-height: 1.6;
            opacity: 0.95;
            max-width: 500px;
        }
        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 20px;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
        }
        .contact-item::before {
            content: '';
            width: 16px;
            height: 16px;
            background: rgba(255,255,255,0.3);
            mask-size: contain;
            mask-repeat: no-repeat;
            mask-position: center;
            -webkit-mask-size: contain;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
            flex-shrink: 0;
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Crect x='2' y='4' width='20' height='16' rx='2'/%3E%3Cpath d='m22 7-10 5L2 7'/%3E%3C/svg%3E");
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Crect x='2' y='4' width='20' height='16' rx='2'/%3E%3Cpath d='m22 7-10 5L2 7'/%3E%3C/svg%3E");
        }
        .contact-item.phone::before {
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/%3E%3C/svg%3E");
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/%3E%3C/svg%3E");
        }
        .contact-item.website::before {
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ccircle cx='12' cy='12' r='4'/%3E%3Cline x1='2' y1='12' x2='4' y2='12'/%3E%3Cline x1='20' y1='12' x2='22' y2='12'/%3E%3Cline x1='12' y1='2' x2='12' y2='4'/%3E%3Cline x1='12' y1='20' x2='12' y2='22'/%3E%3C/svg%3E");
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ccircle cx='12' cy='12' r='4'/%3E%3Cline x1='2' y1='12' x2='4' y2='12'/%3E%3Cline x1='20' y1='12' x2='22' y2='12'/%3E%3Cline x1='12' y1='2' x2='12' y2='4'/%3E%3Cline x1='12' y1='20' x2='12' y2='22'/%3E%3C/svg%3E");
        }
        .contact-item.address::before {
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E");
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E");
        }
        .visual-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            flex-shrink: 0;
        }
        .profile-photo {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid rgba(255,255,255,0.3);
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        }
        .avatar-placeholder {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            background: ${style.accentColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 56px;
            color: ${variant === 'minimal' ? '#1e293b' : '#4f46e5'};
            border: 4px solid rgba(255,255,255,0.3);
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        }
        .qr-code {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .qr-code img {
            width: 120px;
            height: 120px;
            display: block;
        }
        .scan-text {
            text-align: center;
            font-size: 12px;
            color: ${variant === 'minimal' ? '#666' : '#666'};
            margin-top: 8px;
        }
        .social-links {
            margin-top: 20px;
            display: flex;
            gap: 8px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .social-link {
            width: 32px;
            height: 32px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            text-decoration: none;
            color: ${style.textColor};
            transition: all 0.3s ease;
        }
        .social-link:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.1);
        }
        @media print {
            body { background: white; }
            .card { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="card-content">
            <div class="profile-section">
                <div class="name">${profile.fullName}</div>
                <div class="title">${profile.position}</div>
                <div class="company">${profile.companyName}</div>
                ${profile.description ? `<div class="description">${profile.description}</div>` : ''}
                <div class="contact-info">
                    <div class="contact-item">${profile.email}</div>
                    <div class="contact-item phone">${profile.phone}</div>
                    ${profile.website ? `<div class="contact-item website">${profile.website}</div>` : ''}
                    ${profile.address ? `<div class="contact-item address">${profile.address}</div>` : ''}
                </div>
                ${profile.socialLinks && Object.keys(profile.socialLinks).some(key => profile.socialLinks[key]) ? `
                <div class="social-links">
                    ${profile.socialLinks.linkedin ? `<a href="${profile.socialLinks.linkedin}" class="social-link" title="LinkedIn">in</a>` : ''}
                    ${profile.socialLinks.facebook ? `<a href="${profile.socialLinks.facebook}" class="social-link" title="Facebook">f</a>` : ''}
                    ${profile.socialLinks.twitter ? `<a href="${profile.socialLinks.twitter}" class="social-link" title="Twitter">X</a>` : ''}
                    ${profile.socialLinks.instagram ? `<a href="${profile.socialLinks.instagram}" class="social-link" title="Instagram">IG</a>` : ''}
                    ${profile.socialLinks.github ? `<a href="${profile.socialLinks.github}" class="social-link" title="GitHub">GH</a>` : ''}
                    ${profile.socialLinks.whatsapp ? `<a href="${profile.socialLinks.whatsapp}" class="social-link" title="WhatsApp">WA</a>` : ''}
                </div>
                ` : ''}
            </div>
            <div class="visual-section">
                ${profilePhotoBase64 ? 
                    `<img src="${profilePhotoBase64}" alt="${profile.fullName}" class="profile-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` +
                    `<div class="avatar-placeholder" style="display:none;">${profile.fullName.charAt(0).toUpperCase()}</div>`
                    : `<div class="avatar-placeholder">${profile.fullName.charAt(0).toUpperCase()}</div>`
                }
                <div class="qr-code">
                    <img src="${qrCodeImageData}" alt="QR Code">
                    <div class="scan-text">Scan for contact</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    // Use puppeteer to convert HTML to image
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(htmlCard, { waitUntil: 'networkidle0' });
      await page.setViewport({ width: 900, height: 600, deviceScaleFactor: 2 });
      
      const imageBuffer = await page.screenshot({
        type: 'png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 900,
          height: 600
        }
      });
      
      await browser.close();
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="business-card-${profile.fullName.replace(/\s+/g, '-').toLowerCase()}.png"`);
      res.send(imageBuffer);
    } catch (screenshotError) {
      await browser.close();
      throw screenshotError;
    }
  } catch (error) {
    console.error('Error generating business card:', error);
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      message: 'Error generating business card',
    });
  }
});

export default {
  getUserQRCodes,
  getQRCodeByProfile,
  regenerateQRCode,
  downloadQRCode,
  downloadBusinessCard,
};
